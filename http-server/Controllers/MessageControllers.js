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

  if (!content || !chatId) {
    console.log("Invalid data passed into request");
    return res.status(400);
  }

  var newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
  };

  try {
    var message = await Message.create(newMessage);

    message = await message.populate("sender", "name pic").execPopulate();
    message = await message.populate("chat").execPopulate();
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
    const userId = req.user._id;

    const chat = await Chat.findOne({ _id: chatId, users: userId });

    if (!chat) {
      return res.status(404).json({ message: "Chat not found or user not a participant" });
    }

    await Message.updateMany(
      { chat: chatId, sender: { $ne: userId } }, 
      { $addToSet: { readBy: userId } } 
    );
    res.status(200).json({ message: "Read status updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  } 
});

module.exports = { allMessages, sendMessage, messageRead };