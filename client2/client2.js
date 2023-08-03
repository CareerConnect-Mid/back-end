const io = require("socket.io-client");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const SECRET = "secretstring";

const socket = io("http://localhost:3000");
const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFsbSIsImlkIjo2LCJpYXQiOjE2OTEwMzYxNTB9.b5IA7rPOoYDyr2H1MectnwGpDIFuwyT-8sX1K4VI7Ts";
socket.on("connect", () => {
  console.log("Connected to Socket.IO server");
  socket.emit("sendToken", { token });
});
const parsedToken = jwt.verify(token, SECRET);
// Listen for the friendRequestNotification event from the server
socket.on("friendRequestNotification", (data) => {
  console.log("Received friend request notification:", data);
  handleFriendRequest(data);
});

async function handleFriendRequest(data) {
  // Make an HTTP POST request to the server route for sending friend requests
  const response = await axios.post(
    `http://localhost:3000/career/handle-friend-request/${data.senderId}`,
    {
      action: "accept",
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  console.log(response.data);
  socket.emit("friendRequestHandled", {
    senderId: data.senderId,
    receiverId: parsedToken.id,
    message: "the friend request is accepted ",
  });
}

// const senderId = parsedToken.id;
// const senderName = `${parsedToken.username}`;
// const message = `you have a new friend request from ${senderName}`;
// const receiverId = 3; // Replace with the receiver's user ID

// socket.on("newMessage", (data) => {
//   console.log("Received a message", data);
//   // You can handle the friend request notification and show it to the receiver here
// });
