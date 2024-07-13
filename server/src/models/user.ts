import mongoose, { Schema, Document, model } from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

mongoose
	.connect(process.env.DB_URL as string)
	.then(() => {
		console.log("Connected to MongoDB");
	})
	.catch((error) => {
		console.error("Error connecting to MongoDB:", error);
	});

// Define the interface for a User document
export interface User extends Document {
	name: string;
	email: string;
	password: string;
	room?: Schema.Types.ObjectId;
}

// Create a schema for a user
const userSchema = new Schema<User>({
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
		type: Schema.Types.ObjectId,
		ref: "room",
	},
});

// Create and export the model
const userModel = model<User>("User", userSchema);
export default userModel;
