"use strict";
// 3rd Party Resources
const express = require("express");
const app = express();
const cors = require("cors");
const morgan = require("morgan");
const authRoutes = require("./auth/routes");
const v2Routes = require("./routes/v2.js");
const notFoundHandler = require("./error-handlers/404.js");
const errorHandler = require("./error-handlers/500.js");
const http = require("http");
const server = http.createServer(app);
const socketIo = require("socket.io");
const io = socketIo(server);
require("dotenv").config();
/* ------------------------- handle recieved tocken from client , this to be removed later */
const jwt = require("jsonwebtoken");

const SECRET = process.env.SECRET || "secretstring";

/* ----------------------------------------------------------------------------------------*/
// const logger = require("./middleware/logger.js");
const v1Routes = require("./routes/v1.js");
app.use(express.json());
// app.use(logger);
app.use("/api/v1", v1Routes);
app.use("/api/v2", v2Routes);
app.use(authRoutes);
app.get("/", welcomeHandler);
function welcomeHandler(req, res) {
  res.status(200).send("hello home");
}
app.use("*", notFoundHandler);
app.use(errorHandler);
app.use(cors());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));

/* -------------------------------------------------------------------------------------- */
const userSockets = {};
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("sendToken", ({ token }) => {
    const parsedToken = jwt.verify(token, SECRET);
    const userId = parsedToken.id;
    console.log(
      `Received token from the client: welcome ${parsedToken.username}`
    );
    console.log(`User with ID ${userId} connected.`);
    userSockets[userId] = socket.id;
  });
  /*---------------------- handle friend request notification - mohannad ------------------------ */
  socket.on("friendRequest", (data) => {
    console.log("Received friend request:", data);
    const receiverUserId = data.receiverId; // Replace this with the actual receiver's user ID

    // Look up the receiver's socket ID using their user ID from the mapping
    const receiverSocketId = userSockets[receiverUserId];

    if (receiverSocketId) {
      // If the receiver's socket ID is found in the mapping, emit the friendRequestNotification event
      io.to(receiverSocketId).emit("friendRequestNotification", {
        senderId: data.senderId,
        senderName: data.senderName,
        message: data.message,
      });
    } else {
      console.log(`Receiver with user ID ${receiverUserId} is not connected.`);
      // Handle the case when the receiver is not currently connected (optional)
      // For example, you can store the notification in the database and deliver it when the receiver reconnects
    }
  });
  /*---------------------- handle friend request notification - mohannad--------------------- */

  // Handle disconnection if needed
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

/*---------------------------------------------------------------------------------------- */

module.exports = {
  // server: app,
  start: (port) => {
    server.listen(port, () => {
      console.log(`Server Up on ${port}`);
    });
  },
};
