const express = require("express");
const { protect } = require("../middleware/AuthMiddleware")
const { AccessChat, FetchChats, CreateGroupChat, RenameGroupChat, AddToGroup, RemovefromGroup } = require("../Controllers/ChatControllers");


const Router = express.Router();

Router.route("/").post(protect , AccessChat);
Router.route("/").get(protect , FetchChats);
Router.route("/creategroup").post(protect , CreateGroupChat);
Router.route("/renamegroup").put(protect , RenameGroupChat);
Router.route("/addtogroup").put(protect , AddToGroup);
Router.route("/removefromgroup").put(protect , RemovefromGroup);

module.exports = Router ;

