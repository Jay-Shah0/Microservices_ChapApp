const asyncHandler = require("express-async-handler");
const User = require("../Model/UserModel");
const expressAsyncHandler = require("express-async-handler");
const pool = require("../Config/pgDB");

const registerUserProfile = asyncHandler(async (req, res) => {
  // This function remains unchanged as it creates the user.
  const { name, email, pic } = req.body;

  if (!name || !email) {
    res.status(400);
    throw new Error("Please provide name and email");
  }

  const user = await User.create({
    name,
    email,
    pic,
  });
  if (user) {
    const mongoId = user._id;

    const updateQuery = `
      UPDATE users 
      SET moongo_id = $1 
      WHERE email = $2;
    `;
    await pool.query(updateQuery, [mongoId, email]);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      pic: user.pic,
    });
  } else {
    res.status(400);
    throw new Error("Failed to create the user profile");
  }
});

const getUserProfile = asyncHandler(async (req, res) => {
  // This function already uses the correct header name.
  const userId = req.headers["x-user-id"];

  if (!userId) {
    res.status(400);
    throw new Error(
      "User ID not found in headers. Authorization may have failed."
    );
  }

  const user = await User.findById(userId).select("-password");

  if (user) {
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      pic: user.pic,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

const SearchUser = expressAsyncHandler(async (req, res) => {
  // CORRECTED: Using 'x-user-id' for consistency.
  const loggedInUserId = req.headers["x-user-id"];
  const searchQuery = req.query.search;
  
  const userQuery = searchQuery
    ? {
        $or: [
          { name: { $regex: searchQuery, $options: "i" } },
          { email: { $regex: searchQuery, $options: "i" } },
        ],
      }
    : {};

  // Find users that match the query AND are not the logged-in user.
  const users = await User.find(userQuery)
    .find({ _id: { $ne: loggedInUserId } })
    .select("_id name email pic");
    
  res.send(users);
});

module.exports = { registerUserProfile, getUserProfile, SearchUser };