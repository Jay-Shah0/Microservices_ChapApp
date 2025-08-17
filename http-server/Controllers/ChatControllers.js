const expressAsyncHandler = require("express-async-handler");
const Chat = require("../Model/ChatModel");
const User = require("../Model/UserModel");

const AccessChat = expressAsyncHandler(async (req, res) => {
  const { userId } = req.body; // The other user's ID
  const loggedInUserId = req.headers["x-user-id"];

  if (!userId) {
    console.log("UserId param not sent with request");
    return res.sendStatus(400);
  }

  var isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: loggedInUserId } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage");

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name pic email",
  });

  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    var chatData = {
      chatName: "Private Chat",
      isGroupChat: false,
      users: [loggedInUserId, userId],
    };

    try {
      const createdChat = await Chat.create(chatData);
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );
      res.status(200).json(FullChat);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  }
});

const FetchChats = expressAsyncHandler(async (req, res) => {
  const loggedInUserId = req.headers["x-user-id"];
  try {
    Chat.find({ users: { $elemMatch: { $eq: loggedInUserId } } })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 })
      .then(async (results) => {
        results = await User.populate(results, {
          path: "latestMessage.sender",
          select: "name pic email",
        });
        res.status(200).send(results);
      });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const CreateGroupChat = expressAsyncHandler(async (req, res) => {
  if (!req.body.users || !req.body.name) {
    return res.status(400).send({ message: "Please Fill all the fields" });
  }

  var users = JSON.parse(req.body.users);
  const loggedInUserId = req.headers["x-user-id"];
  users.push(loggedInUserId); // Add the creator to the user list

  if (users.length < 3) {
    return res
      .status(400)
      .send("More than 2 users are required to form a group chat");
  }

  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: loggedInUserId,
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json(fullGroupChat);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const RenameGroupChat = expressAsyncHandler(async (req, res) => {
  const { chatId, chatName } = req.body;

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    { chatName: chatName },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!updatedChat) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(updatedChat);
  }
});

const AddToGroup = expressAsyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;
  const loggedInUserId = req.headers["x-user-id"];

  const chat = await Chat.findById(chatId);
  if (chat.groupAdmin.toString() !== loggedInUserId) {
    res.status(403);
    throw new Error("Only the group admin can add users.");
  }

  const added = await Chat.findByIdAndUpdate(
    chatId,
    { $push: { users: userId } },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!added) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(added);
  }
});

const RemovefromGroup = expressAsyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;
  const loggedInUserId = req.headers["x-user-id"];
  
  const chat = await Chat.findById(chatId);
  if (chat.groupAdmin.toString() !== loggedInUserId && userId !== loggedInUserId) {
    res.status(403);
    throw new Error("Only the group admin can remove users.");
  }

  const removed = await Chat.findByIdAndUpdate(
    chatId,
    { $pull: { users: userId } },
    { new: true }
  )
    .populate("users")
    .populate("groupAdmin");

  if (!removed) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(removed);
  }
});

module.exports = {
  AccessChat,
  FetchChats,
  CreateGroupChat,
  RenameGroupChat,
  AddToGroup,
  RemovefromGroup,
};