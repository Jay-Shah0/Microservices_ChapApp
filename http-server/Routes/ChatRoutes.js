const express = require("express");
const { mapPostgresIdToMongoId } = require("../middleware/mapIdMiddleware");
const { AccessChat, FetchChats, CreateGroupChat, RenameGroupChat, AddToGroup, RemovefromGroup } = require("../Controllers/ChatControllers");


const Router = express.Router();

Router.route("/").post(mapPostgresIdToMongoId, AccessChat);
Router.route("/").get(mapPostgresIdToMongoId , FetchChats);
Router.route("/creategroup").post(mapPostgresIdToMongoId , CreateGroupChat);
Router.route("/renamegroup").put(mapPostgresIdToMongoId , RenameGroupChat);
Router.route("/addtogroup").put(mapPostgresIdToMongoId , AddToGroup);
Router.route("/removefromgroup").put(mapPostgresIdToMongoId , RemovefromGroup);

module.exports = Router ;

