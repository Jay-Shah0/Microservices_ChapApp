const asyncHandler = require("express-async-handler");
const pool = require("../Config/pgDB");

const mapPostgresIdToMongoId = asyncHandler(async (req, res, next) => {
  const postgresUserId = req.headers["x-user-id"];

  if (!postgresUserId) {
    res.status(401);
    throw new Error("Not authorized, user ID not found in header.");
  }

  // Find the user in PostgreSQL to get their linked MongoDB ID
  const { rows } = await pool.query(
    "SELECT moongo_id FROM users WHERE id = $1",
    [postgresUserId]
  );

  const postgresRecord = rows[0];

  if (!postgresRecord || !postgresRecord.moongo_id) {
    res.status(404);
    throw new Error("User profile not linked or not found.");
  }

  // Replace the original header with the MongoDB ID
  req.headers["x-user-id"] = postgresRecord.moongo_id;

  // Pass control to the next function (the controller)
  next();
});

module.exports = { mapPostgresIdToMongoId };