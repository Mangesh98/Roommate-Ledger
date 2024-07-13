const express = require("express");
const entryModel = require("../models/entry");
const userModel = require("../models/user");
const roomModel = require("../models/room");
const auth = require("../lib/auth");
const {
	updateLedger,
	decreaseReceivable,
	updateLedgerOnDelete,
} = require("./ledgerRoute");
const router = express.Router();

router.post("/new-entry", auth, async (req, res) => {
	const { date, description, price } = req.body.data;
	const { userId, room } = req.user;
	let { selectedMembers } = req.body.data;
	selectedMembers.push(userId);

	try {
		// Fetch user details for selected members
		const membersPromises = selectedMembers.map(async (userId) => {
			const user = await userModel.findById(userId);
			if (!user) {
				throw new Error(`User with ID ${userId} not found`);
			}
			return {
				userId: user._id,
				userName: user.name,
				paidStatus: false,
			};
		});

		// Resolve all member promises
		let members = await Promise.all(membersPromises);

		// Update the paidStatus for the current user
		members = members.map((member) => {
			if (member.userId.toString() === userId) {
				member.paidStatus = true;
			}
			return member;
		});

		// console.log(members);

		// Create new entry
		const newEntry = await entryModel.create({
			room,
			date,
			description,
			amount: price,
			paidBy: userId,
			members: members,
		});

		// Update Ledger
		await updateLedger(newEntry);

		res
			.status(201)
			.json({ success: true, message: "New Entry Created Successfully" });
	} catch (error) {
		console.error("Failed to create new entry:", error);
		res
			.status(500)
			.json({ success: false, message: "Server error", error: error.message });
	}
});

router.post("/get-all-entry", auth, async (req, res) => {
	const { room, userId, name, email } = req.user;
	const { page = 1, limit = 10 } = req.body;
	// console.log(req.body);
	try {
		// Fetch entries with sorting and pagination
		const entries = await entryModel
			.find({ room })
			.sort({ date: -1 })
			.skip((page - 1) * limit)
			.limit(limit);

		if (!entries) {
			return res
				.status(404)
				.json({ success: false, message: "No entries found for this room" });
		}

		const totalEntries = await entryModel.countDocuments({ room }); // Count total entries for pagination info
		const totalPages = Math.ceil(totalEntries / limit); // Calculate total pages

		const roomResponse = await roomModel.findOne({ _id: room });
		if (!roomResponse) {
			return res
				.status(401)
				.json({ success: false, message: "Invalid Room !" });
		}

		const userData = {
			userId: userId,
			userName: name,
			email: email,
			roomId: room,
			roomName: roomResponse.name,
		};

		res.status(200).json({
			success: true,
			entries: entries,
			user: userData,
			pagination: {
				page,
				limit,
				totalPages,
				totalEntries,
			},
		});
	} catch (error) {
		console.error("Failed to fetch entries:", error);
		res
			.status(500)
			.json({ success: false, message: "Server error", error: error.message });
	}
});

router.post("/get-my-entry", auth, async (req, res) => {
	const { room, userId, name } = req.user;
	let { page = 1, limit = 10 } = req.body;

	// Ensure page and limit are valid numbers
	page = Math.max(page, 1);
	limit = Math.max(limit, 1);

	try {
		// Fetch entries with sorting and pagination
		const entries = await entryModel
			.find({ room, paidBy: userId })
			.sort({ date: -1 })
			.skip((page - 1) * limit)
			.limit(limit);

		if (!entries.length) {
			return res
				.status(404)
				.json({ success: false, message: "No entries found for this room" });
		}

		const totalEntries = await entryModel.countDocuments({
			room,
			paidBy: userId,
		}); // Count total entries for pagination info
		const totalPages = Math.ceil(totalEntries / limit); // Calculate total pages

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
		console.error("Failed to fetch entries:", error);
		res
			.status(500)
			.json({ success: false, message: "Server error", error: error.message });
	}
});

router.post("/update-entry", auth, async (req, res) => {
	const { entryId, paidBy, amount } = req.body.data;
	const { userId } = req.user;

	try {
		const updatedEntry = await entryModel.findOneAndUpdate(
			{ _id: entryId, "members.userId": userId },
			{ $set: { "members.$.paidStatus": true } },
			{ new: true }
		);

		if (!updatedEntry) {
			throw new Error("Entry or member not found");
		}
		// Update Ledger
		const record = await decreaseReceivable(paidBy, userId, amount);
		// console.log(record);

		res.status(201).json({ success: true, message: "Updated Successfully" });
	} catch (error) {
		console.error("Failed to create new entry:", error);
		res
			.status(500)
			.json({ success: false, message: "Server error", error: error.message });
	}
});

router.post("/delete-entry", auth, async (req, res) => {
	const { entryId } = req.body;
	const { room } = req.user;

	try {
		// Find the entry to be deleted
		const entry = await entryModel.findOne({ _id: entryId, room });

		if (!entry) {
			return res
				.status(404)
				.json({ success: false, message: "Entry not found" });
		}

		await entry.deleteOne();

		// Update Ledger
		await updateLedgerOnDelete(entry);

		res
			.status(200)
			.json({ success: true, message: "Entry deleted successfully" });
	} catch (error) {
		console.error("Failed to delete entry:", error);
		res
			.status(500)
			.json({ success: false, message: "Server error", error: error.message });
	}
});

module.exports = router;
