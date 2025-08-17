const express = require("express")
const { registerUserProfile,getUserProfile, SearchUser } = require("../Controllers/UserControllers");
const { mapPostgresIdToMongoId } = require("../middleware/mapIdMiddleware");

const Router = express.Router()

Router.route("/").post(registerUserProfile).get(mapPostgresIdToMongoId, SearchUser);
Router.route("/profile").get(mapPostgresIdToMongoId, getUserProfile);
module.exports = Router;