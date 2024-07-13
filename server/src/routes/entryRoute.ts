import express, { Request, Response } from "express";
import entryModel from "../models/entry";
import userModel from "../models/user";
import auth from "../lib/auth";
import {
	decreaseReceivable,
	updateLedger,
	updateLedgerOnDelete,
} from "./ledgerRoute";
import { AuthenticatedRequest } from "../lib/auth";
import roomModel from "../models/room";

const router = express.Router();

router.post(
	"/new-entry",
	auth,
	async (req: AuthenticatedRequest, res: Response) => {
		const { date, description, price } = req.body.data;

		// Assert user is defined
		const { userId, room } = req.user as { userId: string; room?: string };

		let { selectedMembers } = req.body.data;
		selectedMembers.push(userId);

		try {
			const membersPromises = selectedMembers.map(async (userId: string) => {
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

			let members = await Promise.all(membersPromises);

			members = members.map((member) => {
				if (member.userId.toString() === userId) {
					member.paidStatus = true;
				}
				return member;
			});

			const newEntry = await entryModel.create({
				room,
				date,
				description,
				amount: price,
				paidBy: userId,
				members: members,
			});

			await updateLedger(newEntry);

			res
				.status(201)
				.json({ success: true, message: "New Entry Created Successfully" });
		} catch (error) {
			console.error("Failed to create new entry:", error);
			res.status(500).json({
				success: false,
				message: "Server error",
				error: (error as Error).message,
			});
		}
	}
);

router.post(
	"/get-all-entry",
	auth,
	async (req: AuthenticatedRequest, res: Response) => {
		const { room, userId, name, email } = req.user as {
			room: string;
			userId: string;
			name: string;
			email: string;
		};
		const { page = 1, limit = 10 } = req.body;

		try {
			// Fetch entries with sorting and pagination
			const entries = await entryModel
				.find({ room })
				.sort({ date: -1 })
				.skip((page - 1) * limit)
				.limit(limit);

			// console.log(entries);

			if (entries.length === 0) {
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
					.json({ success: false, message: "Invalid Room!" });
			}

			const userData = {
				userId,
				userName: name,
				email,
				roomId: room,
				roomName: roomResponse.name,
			};

			res.status(200).json({
				success: true,
				entries,
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
			res.status(500).json({
				success: false,
				message: "Server error",
				error: (error as Error).message,
			});
		}
	}
);

router.post(
	"/get-my-entry",
	auth,
	async (req: AuthenticatedRequest, res: Response) => {
		const { room, userId, name } = req.user as {
			room: string;
			userId: string;
			name: string;
		};

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

			if (entries.length === 0) {
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
				entries,
				pagination: {
					page,
					limit,
					totalPages,
					totalEntries,
				},
			});
		} catch (error) {
			console.error("Failed to fetch entries:", error);
			res.status(500).json({
				success: false,
				message: "Server error",
				error: (error as Error).message,
			});
		}
	}
);

router.post(
	"/update-entry",
	auth,
	async (req: AuthenticatedRequest, res: Response) => {
		const { entryId, paidBy, amount } = req.body.data;
		const { userId } = req.user as { userId: string };

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
			console.error("Failed to update entry:", error);
			res.status(500).json({
				success: false,
				message: "Server error",
				error: (error as Error).message,
			});
		}
	}
);

router.post(
	"/delete-entry",
	auth,
	async (req: AuthenticatedRequest, res: Response) => {
		const { entryId } = req.body;
		const { room } = req.user as { room: string };

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
			res.status(500).json({
				success: false,
				message: "Server error",
				error: (error as Error).message,
			});
		}
	}
);

export default router;
