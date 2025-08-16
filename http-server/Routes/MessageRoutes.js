const express = require("express");
const {
  allMessages,
  sendMessage,
  messageRead,
} = require("../Controllers/MessageControllers.js");
const { mapPostgresIdToMongoId } = require("../middleware/mapIdMiddleware");

const Router = express.Router();

Router.route("/:chatId").get(mapPostgresIdToMongoId, allMessages);
Router.route("/readressage").put(mapPostgresIdToMongoId, messageRead);
Router.route("/").post(mapPostgresIdToMongoId, sendMessage);

module.exports = Router;