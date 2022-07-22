const mongoose = require("mongoose");

async function connect() {
  try {
    const dbConnection = await mongoose.connect(process.env.MONGODB_URI);

    console.log("Connected to DB:", dbConnection.connection.name);
  } catch (err) {
    console.log("DB connection error", err);
  }
}

module.exports = connect;
