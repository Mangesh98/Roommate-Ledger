import mongoose from "mongoose";

export interface NewEntry {
	room: mongoose.Types.ObjectId; // Change to ObjectId
	paidBy: mongoose.Types.ObjectId; // Change to ObjectId
	members: Member[];
	amount: number;
}

export interface DeletedEntry {
	room: mongoose.Types.ObjectId;
	paidBy: mongoose.Types.ObjectId;
	members: Member[];
	amount: number;
}

export interface Member {
	userId: mongoose.Types.ObjectId;
	userName: string;
}
