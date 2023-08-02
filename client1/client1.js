const io = require("socket.io-client");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const socket = io("http://localhost:3000");
const SECRET = "secretstring";
const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFobSIsImlkIjo1LCJpYXQiOjE2OTA5NDIzODF9.PljEykV7WQkShcREYiZWhcPw2vVyXrK1rvGKV0qrb-Q";
socket.on("connect", () => {
  console.log("Connected to Socket.IO server");
  socket.emit("sendToken", { token });
});
const parsedToken = jwt.verify(token, SECRET);

async function sendFriendRequest(senderId, senderName, message, receiverId) {
  try {
    // Make an HTTP POST request to the server route for sending friend requests
    const response = await axios.post(
      `http://localhost:3000/career/send-friend-request/${receiverId}`,
      {
        message: " hello friend request",
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log(response.data);
    socket.emit("friendRequest", {
      senderId: senderId,
      senderName: senderName,
      message: message,
      receiverId: receiverId,
    });
  } catch (error) {
    console.error("Error sending friend request:", error.response.data);
  }
}

// async function sendFriendRequest(senderId, senderName, message, receiverId) {
//   try {
//     // Make an HTTP POST request to the server route for sending friend requests
//     const response = await axios.post(
//       `http://localhost:3000/api/v2/send-friend-request/${receiverId}`,
//       {
//         message: " hello friend request",
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );

//     console.log(response.data);
//     socket.emit("friendRequest", {
//       senderId: senderId,
//       senderName: senderName,
//       message: message,
//       receiverId: receiverId,
//     });
//   } catch (error) {
//     console.error("Error sending friend request:", error.response.data);
//   }
// }

const senderId = parsedToken.id;
const senderName = `${parsedToken.username}`;
const message = "Hello, let's be friends!";
const receiverId = 6; // Replace with the receiver's user ID
sendFriendRequest(senderId, senderName, message, receiverId);
