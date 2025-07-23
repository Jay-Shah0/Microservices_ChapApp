const express = require("express");
const {
  allMessages,
  sendMessage,
  messageRead,
} = require("../Controllers/MessageControllers.js");
const { protect } = require("../middleware/AuthMiddleware.js");

const Router = express.Router();

Router.route("/:chatId").get(protect, allMessages);
Router.route("/readressage").put(protect, messageRead);
Router.route("/").post(protect, sendMessage);

module.exports = Router;