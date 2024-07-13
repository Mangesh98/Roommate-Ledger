const mongoose = require("mongoose");

const ledgerSchema = mongoose.Schema({
	room: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
	},
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
	},
	members: [
		{
			userId: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "user",
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

module.exports = mongoose.model("ledger", ledgerSchema);
