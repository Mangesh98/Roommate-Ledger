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
	name: String,
	email: String,
	password: String,
});

module.exports = mongoose.model("user", userSchema);
