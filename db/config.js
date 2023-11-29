const mongoose = require("mongoose");
require("dotenv/config");

mongoose.set("strictQuery", false);

module.exports.connectDatabase = async () => {
  console.log("Connecting to Database ...");

  mongoose.connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  return mongoose.connection;
};
