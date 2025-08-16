const asyncHandler = require("express-async-handler");
const Message = require("../Model/MessageModel");
const User = require("../Model/UserModel");
const Chat = require("../Model/ChatModel");

const allMessages = asyncHandler(async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name pic email")
      .populate("chat");
    res.json(messages);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId } = req.body;
  const loggedInUserId = req.headers["x-user-id"];

  if (!content || !chatId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  var newMessage = {
    sender: loggedInUserId,
    content: content,
    chat: chatId,
  };

  try {
    var message = await Message.create(newMessage);

    message = await message.populate("sender", "name pic");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });

    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

    res.json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const messageRead = asyncHandler(async (req, res) => {
  try {
    const { chatId } = req.body;
    const loggedInUserId = req.headers["x-user-id"];

    const chat = await Chat.findOne({ _id: chatId, users: loggedInUserId });

    if (!chat) {
      return res
        .status(404)
        .json({ message: "Chat not found or user not a participant" });
    }

    await Message.updateMany(
      { chat: chatId, sender: { $ne: loggedInUserId } },
      { $addToSet: { readBy: loggedInUserId } }
    );
    res.status(200).json({ message: "Read status updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = { allMessages, sendMessage, messageRead };