const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const userModel = require("../models/user");
const roomModel = require("../models/room");
const { sendVerificationEmail, sendPasswordResetEmail } = require("../utils/emailService");
const e = require("express");
const router = express.Router();

// User Registration
router.post("/register", async (req, res) => {
	const { name, email, password, room } = req.body;
	
	try {
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

		const verificationToken = crypto.randomBytes(32).toString("hex");
		const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

		// Store user data
		const user = await userModel.create({
			name,
			email,
			password: hashedPassword,
			room: roomId,
			verificationToken,
			verificationExpires,
			isVerified: false,
		});

		try {
			// Update room using findByIdAndUpdate instead of direct push
			const updatedRoom = await roomModel.findByIdAndUpdate(
				roomId,
				{
					$push: {
						members: {
							userId: user._id,
							userName: name,
							userEmail: email
						}
					}
				},
				{ new: true, runValidators: true }
			);

			if (!updatedRoom) {
				// If room update fails, cleanup the created user
				await userModel.findByIdAndDelete(user._id);
				return res.status(500).json({
					success: false,
					message: "Failed to update room with new member"
				});
			}

			await sendVerificationEmail(email, verificationToken);

			res.status(201).json({
				success: true,
				message: "Registration successful. Please check your email to verify your account.",
			});
		} catch (error) {
			// If any error occurs, cleanup the created user
			await userModel.findByIdAndDelete(user._id);
			console.error("Registration error:", error);
			res.status(500).json({
				success: false,
				message: "Error creating account. Please try again.",
			});
		}
	} catch (error) {
		// console.log(error);
		
		res.status(500).json({
			success: false,
			message: "Error creating account. Please try again.",
		});
	}
});

// Email Verification
router.get("/verify-email/:token", async (req, res) => {
	try {
		const user = await userModel.findOne({
			verificationToken: req.params.token,
			verificationExpires: { $gt: Date.now() },
		});

		if (!user) {
			return res.status(400).json({
				success: false,
				message: "Invalid or expired verification token",
			});
		}

		user.isVerified = true;
		user.verificationToken = undefined;
		user.verificationExpires = undefined;
		await user.save();

		res.json({
			success: true,
			message: "Email verified successfully. You can now login.",
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Error verifying email",
		});
	}
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
	res.status(200).json({
		success: true,
		message: "Login successful",
		token: token,
	});
});

// Forgot Password
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    // Send password reset email
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    await sendPasswordResetEmail(email, resetUrl);

    res.json({
      success: true,
      message: "Password reset link has been sent to your email",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "Error sending password reset email",
    });
  }
});

// Reset Password
router.post("/reset-password/:token", async (req, res) => {
  try {
    const { password } = req.body;
    const { token } = req.params;

    const user = await userModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Password reset token is invalid or has expired",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: "Password has been reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Error resetting password",
    });
  }
});

module.exports = router;
