const express = require("express");
const roomModel = require("../models/room");
const auth = require("../lib/auth");
const room = require("../models/room");
const categoryModel = require("../models/category");
const router = express.Router();

router.post("/create-room", auth, async (req, res) => {
	const { roomName } = req.body;
	const { id, fullName, email } = req.user;
	const members = {
		userId: id,
		userName: fullName,
		userEmail: email,
	};

	// console.log(roomName, members);
	const room = await roomModel.create({
		name: roomName,
		members,
	});
	// console.log(room);
	res
		.status(201)
		.json({ success: true, message: "Room created successfully", room });
});

router.post("/get-room-details", auth, async (req, res) => {
	const roomId = req.user.room;
	const userId = req.user.userId;

	try {
		const room = await roomModel.findById(roomId);
	
		if (!room) {
			return res.status(404).json({ message: "Room not found" });
		}

		// Filter out the current user's details
		const members = room.members
			// .filter((member) => member.userId.toString() !== userId.toString())
			.filter(
				(member) =>
					member.userId.toString() !== userId.toString() && member.active // added - filter by member active status
			)
			.map((member) => ({
				userId: member.userId,
				userName: member.userName,
				_id: member._id,
			}));
		const categories = await categoryModel.find().sort({ name: 1 }); // added - get categories for the room
		res
			.status(200)
			.json({ success: true, members: members, categories: categories });
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Server error",
			error: error.message,
		});
	}
});

module.exports = router;
