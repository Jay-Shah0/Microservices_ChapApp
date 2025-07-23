const express = require("express")
const { RegisterUser, AuthUser,SearchUser } = require("../Controllers/UserControllers");
const { checkTokenExpiry } = require("../middleware/AuthMiddleware");

const Router = express.Router()

Router.route("/").post(RegisterUser).get( SearchUser ); 
Router.route("/login").post(AuthUser);
Router.route("/auth").get(checkTokenExpiry);

module.exports = Router;