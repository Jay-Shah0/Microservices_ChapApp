const mongoose = require("mongoose");

const chatmodel = mongoose.Schema(
	{
		chatName: {
			type: String,
			trim: true,
		},
		isGroupChat: {
			type: Boolean,
			default: false,
		},
		users: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
			},
		],
		latestMessage: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Message",
		},
		groupAdmin: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
			},
		],
		pic: {
			type: String,
			required: true,
			default:
				"https://icon-library.com/images/group-icon-png/group-icon-png-12.jpg",
		},
	},
	{
		timestamps: true,
	}
);

const Chat = mongoose.model("Chat", chatmodel);

module.exports = Chat;
