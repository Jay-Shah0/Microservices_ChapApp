const jwt = require("jsonwebtoken");
const User = require("../Model/UserModel.js");
const asyncHandler = require("express-async-handler");

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-password");

      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
    res.status(401);
    throw new Error("Not authorized, token has expired");
  } else if (error.name === "JsonWebTokenError") {
    res.status(401);
    throw new Error("Not authorized, invalid token");
  } else {
    res.status(401);
    throw new Error("Not authorized, token failed");
  }
    }
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }
});


const checkTokenExpiry = (req, res) => {
	// Get token from headers
	const token = req.header("Authorization")?.replace("Bearer ", "");

	if (!token) {
		return res.status(401).json({ message: "No token, authorization denied" });
	}

	try {
		// Verify token
		jwt.verify(token, process.env.JWT_SECRET);
		// If token is valid
		res.status(200).json({ message: "Token is valid" });
	} catch (err) {
		// If token is not valid, it has expired or is invalid
		res.status(401).json({ message: "Token has expired" });
	}
};

module.exports = { protect, checkTokenExpiry };