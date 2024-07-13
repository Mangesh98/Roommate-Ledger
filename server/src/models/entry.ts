import mongoose, { Document, Schema } from "mongoose";

interface Member {
	userId: mongoose.Types.ObjectId;
	userName: string;
	paidStatus?: boolean; 
}

interface Entry extends Document {
	room: mongoose.Types.ObjectId;
	date: Date;
	description: string;
	amount: number;
	paidBy: mongoose.Types.ObjectId;
	members: Member[];
	createdAt: Date;
}

const entrySchema: Schema = new Schema({
	room: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
	},
	date: {
		type: Date,
		required: true,
	},
	description: {
		type: String,
		required: true,
	},
	amount: {
		type: Number,
		required: true,
	},
	paidBy: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
	},
	members: [
		{
			userId: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "user",
				required: true,
			},
			userName: {
				type: String,
				required: true,
			},
			paidStatus: {
				type: Boolean,
				default: false,
			},
		},
	],
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

// Export the model
export default mongoose.model<Entry>("entry", entrySchema);
