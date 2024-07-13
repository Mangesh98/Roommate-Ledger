import mongoose, { Schema, Document, model } from "mongoose";

export interface Member {
	_id: mongoose.Types.ObjectId;
	userId: mongoose.Types.ObjectId;
	userName: string;
	userEmail: string;
}

export interface Room extends Document {
	name: string;
	members: Member[];
}

const roomSchema = new Schema<Room>({
	name: {
		type: String,
		required: true,
		unique: true,
	},
	members: [
		{
			userId: {
				type: Schema.Types.ObjectId,
				ref: "user",
				required: true,
			},
			userName: {
				type: String,
				required: true,
			},
			userEmail: {
				type: String,
				required: true,
			},
		},
	],
});

const roomModel = model<Room>("Room", roomSchema);
export default roomModel;
