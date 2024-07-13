import express, { Response } from "express";
import roomModel, { Member } from "../models/room";
import auth from "../lib/auth";
import { AuthenticatedRequest } from "../lib/auth"; // Assuming you export this interface from auth.ts

const router = express.Router();

router.post(
	"/create-room",
	auth,
	async (req: AuthenticatedRequest, res: Response) => {
		const { roomName } = req.body;
		const { userId, name, email } = req.user as {
			userId: string;
			name: string;
			email: string;
		}; // Type assertion for user object

		const members = {
			userId,
			userName: name,
			userEmail: email,
		};

		const room = await roomModel.create({
			name: roomName,
			members: [members], // Ensure members is an array
		});

		res
			.status(201)
			.json({ success: true, message: "Room created successfully", room });
	}
);

router.post(
	"/get-room-details",
	auth,
	async (req: AuthenticatedRequest, res: Response) => {
		const roomId = req.user?.room;
		const userId = req.user?.userId;

		if (!roomId || !userId) {
			return res
				.status(400)
				.json({ success: false, message: "Invalid request" });
		}

		try {
			const room = await roomModel.findById(roomId);

			if (!room) {
				return res.status(404).json({ message: "Room not found" });
			}

			// Filter out the current user's details
			const members = room.members
				.filter(
					(member: Member) => member.userId.toString() !== userId.toString()
				)
				.map((member: Member) => ({
					userId: member.userId,
					userName: member.userName,
					_id: member._id,
				}));

			res.status(200).json({ success: true, members: members });
		} catch (error: unknown) {
			res.status(500).json({
				success: false,
				message: "Server error",
				error: (error as Error).message,
			});
		}
	}
);

export default router;
