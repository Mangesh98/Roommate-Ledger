const express = require("express");
const entryModel = require("../models/entry");
const auth = require("../lib/auth");
const router = express.Router();

router.post("/new-entry", auth, async (req, res) => {
	const { date, description, amount, members, } = req.body;
	const { id, fullName, room } = req.user;
	
	console.log(req.body);

	// console.log(roomName, members);
	// const newEntry = await entryModel.create({
	// 	room,date,description,amount,paidBy:id,members
	// });
	// console.log(room);
	// res.status(201).json({ message: "Room created successfully", newEntry });
});
// router.get("/get-my-entry",auth,async(req,res)=>{

// });
// router.get("/get-entry", auth, async (req, res) => {
	
// });

module.exports = router;
