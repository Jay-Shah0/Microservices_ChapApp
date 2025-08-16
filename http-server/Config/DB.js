const mongoose = require("mongoose");
const colors = require("colors"); 

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`MongoDB Connected Successfully`.cyan.underline);
  } catch (error) {
    console.error(`Error: ${error.message}`.red.bold);
    process.exit(1); 
  }
};

module.exports = connectDB;