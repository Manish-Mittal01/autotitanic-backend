const app = require("./app");
const { connectDatabase } = require("./db/config");
require("dotenv/config");

const main = async () => {
  await connectDatabase().then((db) => {
    db.on("error", (err) => {
      console.error("Failed to connect to database", err);
      process.exit(1);
    });

    db.once("open", () => {
      console.info("Connected to database");

      app.listen(process.env.PORT, () => {
        console.log(`App is running on ${process.env.PORT}`);
      });
    });
  });
};

main();
