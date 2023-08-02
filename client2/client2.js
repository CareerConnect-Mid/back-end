const io = require("socket.io-client");
const axios = require("axios");

const socket = io("http://localhost:3000");
const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Im1vaCIsImlkIjo2LCJpYXQiOjE2OTA5NDI0MTB9.QzF0sJj4lh0MaPNaA3E-QTR8pCXg2B-irgrtxqlwtYg";
socket.on("connect", () => {
  console.log("Connected to Socket.IO server");
  socket.emit("sendToken", { token });
});

// Listen for the friendRequestNotification event from the server
socket.on("friendRequestNotification", (data) => {
  console.log("Received friend request notification:", data);
  // You can handle the friend request notification and show it to the receiver here
});
