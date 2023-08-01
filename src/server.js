"use strict";

require("dotenv").config();
const port = process.env.PORT || 3001;
const express = require("express");
const app = express();
const cors = require("cors");
const morgan = require("morgan");
const authRoutes = require("./auth/routes");
const v2Routes = require("./routes/v2.js");
const v3Routes = require("./routes/v3.js");
const notFoundHandler = require("./error-handlers/404.js");
const errorHandler = require("./error-handlers/500.js");
const v1Routes = require("./routes/v1.js");
const http = require('http');
const { Server } = require("socket.io");
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
      origin: `http://localhost:${process.env.PORT}/`,
      methods: ["GET", "POST"]
  }
});

//--------------------------
app.use(express.json());
app.use("/api/v1", v1Routes);
app.use("/career", v2Routes);
app.use("/careerjob", v3Routes);
app.use(authRoutes);
// app.get("/", welcomeHandler);
// function welcomeHandler(req, res) {
//   res.status(200).send("hello home");
// }
app.use("*", notFoundHandler);
app.use(errorHandler);
app.use(cors());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));

module.exports = {
  // server: app,
  start: (port) => {
    server.listen(port, () => {
      console.log(`Server Up on ${port}`);
    });
  },
};
