const express = require("express");
const entryModel = require("../models/entry");
const userModel = require("../models/user");
const auth = require("../lib/auth");
const router = express.Router();

router.post("/new-entry", auth, async (req, res) => {
	const { date, description, price } = req.body.data;
	const { userId, room, fullName } = req.user;
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

		console.log(members);

		// Create new entry
		const newEntry = await entryModel.create({
			room,
			date,
			description,
			amount: price,
			paidBy: userId,
			members: members,
		});
		// console.log(newEntry);
		res.status(201).json({ message: "New Entry Created Successfully" });
	} catch (error) {
		console.error("Failed to create new entry:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
});

// router.get("/get-my-entry",auth,async(req,res)=>{

// });
router.get("/get-entry", auth, async (req, res) => {
	const { room } = req.user;

	try {
		// Fetch all entries for the user's room
		const entries = await entryModel
			.find({ room })
			.populate("members.userId", "name"); // Populate user details if necessary

		if (!entries) {
			return res
				.status(404)
				.json({ message: "No entries found for this room" });
		}
		console.log(entries);
		res.status(200).json(entries);
	} catch (error) {
		console.error("Failed to fetch entries:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
});

module.exports = router;
