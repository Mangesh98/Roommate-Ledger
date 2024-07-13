import express, { Response, Request } from "express";
import ledgerModel from "../models/ledger";
import auth from "../lib/auth";
import { AuthenticatedRequest } from "../lib/auth";
import { DeletedEntry, NewEntry } from "../types/types";

const router = express.Router();




async function updateLedger(newEntry: NewEntry) {
	try {
		const { room, paidBy, members, amount } = newEntry;
		const totalMembers = members.length;
		const payableAmount = Math.round(amount / totalMembers);

		await Promise.all(
			members.map(async (member) => {
				const { userId, userName } = member;
				let ledger = await ledgerModel.findOne({ room, userId });

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
					// Ensure members exist in the ledger
					members.forEach((m) => {
						const existingMember = ledger?.members.find(
							(mem) => mem.userId.toString() === m.userId.toString()
						);
						if (!existingMember) {
							ledger?.members.push({
								userId: m.userId,
								userName: m.userName,
								payable: 0,
								receivable: 0,
							});
						}
					});
				}

				// Check if ledger is not null before saving
				await ledger.save();
			})
		);

		await Promise.all(
			members.map(async (member) => {
				const { userId } = member;

				if (userId.toString() === paidBy.toString()) {
					await Promise.all(
						members.map(async (member) => {
							if (member.userId.toString() !== paidBy.toString()) {
								await ledgerModel.findOneAndUpdate(
									{ room, userId: paidBy, "members.userId": member.userId },
									{ $inc: { "members.$.receivable": payableAmount } },
									{ new: true }
								);
							}
						})
					);
				} else {
					await ledgerModel.findOneAndUpdate(
						{ room, userId, "members.userId": paidBy },
						{ $inc: { "members.$.payable": payableAmount } },
						{ new: true }
					);
				}
			})
		);
	} catch (error) {
		console.error("Failed to update ledger:", error);
		throw error;
	}
}

async function updateLedgerOnDelete(deletedEntry: DeletedEntry) {
	try {
		const { room, paidBy, members, amount } = deletedEntry;
		const totalMembers = members.length;
		const payableAmount = Math.round(amount / totalMembers);

		await Promise.all(
			members.map(async (member) => {
				const { userId } = member;

				if (userId.toString() === paidBy.toString()) {
					await Promise.all(
						members.map(async (member) => {
							if (member.userId.toString() !== paidBy.toString()) {
								await ledgerModel.findOneAndUpdate(
									{ room, userId: paidBy, "members.userId": member.userId },
									{ $inc: { "members.$.receivable": -payableAmount } },
									{ new: true }
								);
							}
						})
					);
				} else {
					await ledgerModel.findOneAndUpdate(
						{ room, userId, "members.userId": paidBy },
						{ $inc: { "members.$.payable": -payableAmount } },
						{ new: true }
					);
				}
			})
		);
	} catch (error) {
		console.error("Failed to update ledger on delete:", error);
		throw error;
	}
}

async function decreaseReceivable(
	userId: string,
	memberId: string,
	amount: number
) {
	try {
		const updatedReceivable = await ledgerModel.findOneAndUpdate(
			{ userId, "members.userId": memberId },
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

		return updatedReceivable;
	} catch (error) {
		console.error("Error updating receivable:", error);
		throw error;
	}
}

router.post(
	"/get-ledger",
	auth,
	async (req: AuthenticatedRequest, res: Response) => {
		const { room, userId, name } = req.user || {};
		if (!room || !userId || !name) {
			return res
				.status(401)
				.json({ success: false, message: "User not authenticated" });
		}

		try {
			const ledger = await ledgerModel.find({ room, userId });

			if (!ledger || ledger.length === 0) {
				return res
					.status(404)
					.json({ success: false, message: "No entries found for this room" });
			}

			const userData = {
				roomId: room,
				name,
				id: userId,
			};

			res.status(200).json({ success: true, ledger, user: userData });
		} catch (error) {
			console.error("Failed to fetch ledger:", error);
			res.status(500).json({
				success: false,
				message: "Server error",
				error: (error as Error).message,
			});
		}
	}
);

export { router, updateLedger, decreaseReceivable, updateLedgerOnDelete };
