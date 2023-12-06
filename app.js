const express = require("express");
const routes = require("./routers/Routes");
const cors = require("cors");

const app = express();
// app.use(cors({ credentials: true, origin: 'https://admin.stobroker.in' }));
app.use(cors());
app.use(express.json());
app.use(express.static("images"));
app.use("/api/v1", routes);

module.exports = app;
