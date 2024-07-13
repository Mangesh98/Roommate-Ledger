import mongoose, { Document, Schema } from "mongoose";

export interface Member {
	userId: mongoose.Types.ObjectId;
	userName: string;
	payable: number;
	receivable: number;
}

export interface Ledger extends Document {
	room: mongoose.Types.ObjectId;
	userId: mongoose.Types.ObjectId;
	members: Member[];
	updatedAt: Date;
}

const ledgerSchema = new Schema<Ledger>({
	room: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: "Room", // Assuming you have a Room model
	},
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: "User", // Assuming you have a User model
	},
	members: [
		{
			userId: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
			},
			userName: {
				type: String,
			},
			payable: {
				type: Number,
				default: 0,
			},
			receivable: {
				type: Number,
				default: 0,
			},
		},
	],
	updatedAt: {
		type: Date,
		default: Date.now,
	},
});

const ledgerModel = mongoose.model<Ledger>("Ledger", ledgerSchema);

export default ledgerModel;
