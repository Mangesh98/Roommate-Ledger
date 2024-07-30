const express = require("express");
const ledgerModel = require("../models/ledger");
const entryModel = require("../models/entry");

const auth = require("../lib/auth");
const router = express.Router();

async function updateLedger(newEntry) {
	try {
		const { room, paidBy, members, amount } = newEntry;

		// Calculate payable and receivable amounts
		const totalMembers = members.length;
		const payableAmount = Math.round(amount / totalMembers);

		// Ensure each ledger document has the correct members initialized
		await Promise.all(
			members.map(async (member) => {
				const { userId, userName } = member;

				// Find the ledger for the room and userId
				let ledger = await ledgerModel.findOne({ room, userId });

				// If the ledger doesn't exist, create it
				if (!ledger) {
					ledger = new ledgerModel({
						room,
						userId,
						members: members.map((m) => ({
							userId: m.userId,
							userName: m.userName,
							payable: 0,
							receivable: 0,
						})),
					});
				} else {
					// If the ledger exists, ensure it has the members array initialized
					members.forEach((m) => {
						const existingMember = ledger.members.find(
							(mem) => mem.userId.toString() === m.userId.toString()
						);
						if (!existingMember) {
							ledger.members.push({
								userId: m.userId,
								userName: m.userName,
								payable: 0,
								receivable: 0,
							});
						}
					});
				}

				// Save the ledger document
				await ledger.save();
			})
		);

		// Update ledger for each member
		await Promise.all(
			members.map(async (member) => {
				const { userId, userName } = member;

				if (userId.toString() === paidBy.toString()) {
					// console.log("Inside receivable :", userName);
					// Update receivable amount for the user who paid
					await Promise.all(
						members.map(async (member) => {
							if (member.userId.toString() !== paidBy.toString()) {
								const updatedLedger = await ledgerModel.findOneAndUpdate(
									{ room, userId: paidBy, "members.userId": member.userId },
									{
										$inc: { "members.$.receivable": payableAmount },
									},
									{ new: true }
								);
								// console.log("Updated ledger for receivable:", updatedLedger);
							}
						})
					);
				} else {
					// console.log("Inside payable :", userName);
					// Update payable amount for other members
					const updatedLedger = await ledgerModel.findOneAndUpdate(
						{ room, userId, "members.userId": paidBy },
						{
							$inc: { "members.$.payable": payableAmount },
						},
						{ new: true }
					);
					// console.log("Updated ledger for payable:", updatedLedger);
				}
			})
		);

		// console.log("Ledger updated successfully");
	} catch (error) {
		console.error("Failed to update ledger:", error);
		throw error;
	}
}
async function updateLedgerOnDelete(deletedEntry) {
	try {
		const { room, paidBy, members, amount } = deletedEntry;

		// Calculate payable and receivable amounts
		const totalMembers = members.length;
		const payableAmount = Math.round(amount / totalMembers);

		// Update ledger for each member
		await Promise.all(
			members.map(async (member) => {
				const { userId } = member;

				if (userId.toString() === paidBy.toString()) {
					// Update receivable amount for the user who paid
					await Promise.all(
						members.map(async (member) => {
							if (member.userId.toString() !== paidBy.toString()) {
								const updatedLedger = await ledgerModel.findOneAndUpdate(
									{ room, userId: paidBy, "members.userId": member.userId },
									{
										$inc: { "members.$.receivable": -payableAmount },
									},
									{ new: true }
								);
								// console.log("Updated ledger for receivable:", updatedLedger);
							}
						})
					);
				} else {
					// Update payable amount for other members
					const updatedLedger = await ledgerModel.findOneAndUpdate(
						{ room, userId, "members.userId": paidBy },
						{
							$inc: { "members.$.payable": -payableAmount },
						},
						{ new: true }
					);
					// console.log("Updated ledger for payable:", updatedLedger);
				}
			})
		);

		// console.log("Ledger updated successfully on delete");
	} catch (error) {
		console.error("Failed to update ledger on delete:", error);
		throw error;
	}
}

async function decreaseReceivable(userId, memberId, amount) {
	try {
		const updatedReceivable = await ledgerModel.findOneAndUpdate(
			{ userId: userId, "members.userId": memberId },
			{ $inc: { "members.$.receivable": -amount } },
			{ new: true }
		);
		const updatedPayable = await ledgerModel.findOneAndUpdate(
			{ userId: memberId, "members.userId": userId },
			{ $inc: { "members.$.payable": -amount } },
			{ new: true }
		);

		if (!updatedReceivable) {
			throw new Error("Ledger or member not found");
		}

		// console.log("Updated Ledger:", updatedLedger);
		return updatedReceivable;
	} catch (error) {
		console.error("Error updating receivable:", error);
		throw error;
	}
}

router.post("/get-ledger", auth, async (req, res) => {
	const { room, userId, name } = req.user;
	try {
		// Fetch all entries for the user's room
		const ledger = await ledgerModel.find({ room, userId });

		if (!ledger) {
			return res
				.status(404)
				.json({ success: false, message: "No entries found for this room" });
		}

		const userData = {
			roomId: room,
			name: name,
			id: userId,
		};
		// console.log(ledger);
		res.status(200).json({ success: true, ledger: ledger, user: userData });
	} catch (error) {
		console.error("Failed to fetch ledger:", error);
		res
			.status(500)
			.json({ success: false, message: "Server error", error: error.message });
	}
});

router.post("/get-associated-entries", auth, async (req, res) => {
	const { room, userId } = req.user;
	const { memberId } = req.body;
	const { page = 1, limit = 10 } = req.body;
	// console.log("room: " + room + " paidBy:" + userId + " memberId:" + memberId);
	try {
		const entries = await entryModel
			.find({
				room,
				$or: [
					{
						paidBy: memberId,
						members: {
							$elemMatch: {
								userId: userId,
								paidStatus: false,
							},
						},
					},
					{
						paidBy: userId,
						members: {
							$elemMatch: {
								userId: memberId,
								paidStatus: false,
							},
						},
					},
				],
			})
			.sort({ date: -1 })
			.skip((page - 1) * limit)
			.limit(limit);


		// console.log(entries);
		if (!entries) {
			return res
				.status(404)
				.json({ success: false, message: "No associated entries found !" });
		}

		const totalEntries = entries.length;
		const totalPages = Math.ceil(totalEntries / limit); // Calculate total pages
		if(entries.length === 0){
			return res
			.status(200)
			.json({ success: false, message: "No associated entries found !" });
		}
		res.status(200).json({
			success: true,
			entries: entries,
			pagination: {
				page,
				limit,
				totalPages,
				totalEntries,
			},
		});
	} catch (error) {
		console.error("Failed to fetch associated entries:", error);
		res
			.status(500)
			.json({ success: false, message: "Server error", error: error.message });
	}
});

module.exports = {
	router,
	updateLedger,
	decreaseReceivable,
	updateLedgerOnDelete,
};
