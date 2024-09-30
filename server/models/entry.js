const mongoose = require("mongoose");

const entrySchema = mongoose.Schema({
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
	category: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		default:new mongoose.Types.ObjectId("66fa4a4a8bdaf9a7b104372f"), // Uncategorized
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
			isPending: {
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

module.exports = mongoose.model("entry", entrySchema);
