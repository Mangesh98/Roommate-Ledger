const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: ".env" });

mongoose
	.connect(process.env.DB_URL)
	.then(() => {
		console.log("Connected to MongoDB");
	})
	.catch((error) => {
		console.error("Error connecting to MongoDB:", error);
	});

const userSchema = mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
		unique: true,
	},
	password: {
		type: String,
		required: true,
	},
	room: {
		type: mongoose.Schema.Types.ObjectId,
		ref:"room",
	},
	active:{
		type: Boolean,
		default: true
	},
	isVerified: {
		type: Boolean,
		default: false
	},
	verificationToken: String,
	verificationExpires: Date
});

module.exports = mongoose.model("user", userSchema);
