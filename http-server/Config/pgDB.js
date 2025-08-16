const dotenv = require("dotenv");
const colors = require("colors"); // Import for styled console logs
const { Pool } = require("pg");

dotenv.config();

const pool = new Pool({
  connectionString: process.env.Postgres_URI,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Function to check the database connection
const checkDbConnection = async () => {
  try {
    const client = await pool.connect(); // Try to connect to the database
    console.log(`PostgreSQL Connected Successfully`.cyan.underline);
    client.release(); // Release the client back to the pool
  } catch (error) {
    console.error(`Error connecting to PostgreSQL: ${error.message}`.red.bold);
    process.exit(1); // Exit process with failure
  }
};

// Export both the pool for querying and the function for the initial check
module.exports = { pool, checkDbConnection };