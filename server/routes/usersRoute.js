const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user");
const roomModel = require("../models/room");
const router = express.Router();

// User Registration
router.post("/register", async (req, res) => {
	const { name, email, password, room } = req.body;

	// Validate user input
	if (!name || !password || !email || !room) {
		return res
			.status(400)
			.json({ success: false, message: "Please provide valid details" });
	}

	const roomDec = await roomModel.findOne({ name: room });
	if (!roomDec) {
		return res.status(409).json({ success: false, message: "Invalid Room !" });
	}

	const roomId = roomDec._id;

	// Check for existing user
	const existingUser = await userModel.findOne({ email });
	if (existingUser) {
		return res
			.status(409)
			.json({ success: false, message: "Email already exists" });
	}

	// Hash password before storing
	const hashedPassword = await bcrypt.hash(password, 10);

	// Store user data
	const user = await userModel.create({
		name,
		email,
		password: hashedPassword,
		room: roomId,
	});

	// Add the user to the room members
	roomDec.members.push({
		userId: user._id,
		userName: name,
		userEmail: email,
	});
	await roomDec.save();

	let token = jwt.sign(
		{ email: email, userId: user._id, room: roomId, name: name },
		process.env.JWT_SECRET
	);

	res.cookie("token", token, {
		httpOnly: true,
		sameSite: "None",
		secure: true,
	});

	res.status(201).json({
		success: true,
		message: "User registered successfully",
		token: token,
	});
});

// User Login
router.post("/login", async (req, res) => {
	const { email, password } = req.body;

	// Validate user input
	if (!email || !password) {
		return res
			.status(400)
			.json({ success: false, message: "Please provide email and password" });
	}

	// Find user
	const user = await userModel.findOne({ email });
	if (!user) {
		return res
			.status(401)
			.json({ success: false, message: "Invalid email or password" });
	}

	// Compare password hash
	const passwordMatch = await bcrypt.compare(password, user.password);
	if (!passwordMatch) {
		return res
			.status(401)
			.json({ success: false, message: "Invalid email or password" });
	}

	let token = jwt.sign(
		{ email: email, userId: user._id, room: user.room, name: user.name },
		process.env.JWT_SECRET
	);
	res.cookie("token", token, {
		httpOnly: true,
		sameSite: "None",
		secure: true,
	});
	res
		.status(200)
		.json({ success: true, message: "Login successful", token: token });
});

module.exports = router;
