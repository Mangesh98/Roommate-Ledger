const mongoose = require("mongoose");

const roomSchema = mongoose.Schema({
	name: {
		type: String,
		required: true,
		unique: true,
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
			userEmail: {
				type: String,
				required: true,
			},
			active:{
				type: Boolean,
				default:true,
			}
		},
	],
});

module.exports = mongoose.model("room", roomSchema);
