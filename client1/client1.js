const readline = require("readline");

const io = require("socket.io-client");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const socket = io("http://localhost:3000");
const SECRET = "secretstring";
const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFtZXIiLCJpZCI6NCwiaWF0IjoxNjkxNTc5NDQwfQ.YrXIE6jy2Zwg_hzidUD9QCclzzO93CT6dTbGDTgOTAY";
socket.on("connect", () => {
  console.log("Connected to Socket.IO server");
  socket.emit("sendToken", { token });
});
const parsedToken = jwt.verify(token, SECRET);

// async function sendFriendRequest(senderId, senderName, message, receiverId) {
//   try {
//     const response = await axios.post(
//       `http://localhost:3000/career/send-friend-request/${receiverId}`,
//       {
//         message: message,
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

//     socket.on("friendRequestHandled", (data) => {
//       console.log("Received friend request notification:", data);
//     });
//   } catch (error) {
//     console.error("Error sending friend request:", error.response.data);
//   }
// }
// const senderId = parsedToken.id;
// const senderName = `${parsedToken.username}`;
// const message = `you have a new friend request from ${senderName}`;
// const receiverId = 13; // Replace with the receiver's user ID
// sendFriendRequest(senderId, senderName, message, receiverId);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function sendMessage(receiverId) {
  rl.question("Enter your message:\n", async (message) => {
    try {
      const response = await axios.post(
        `http://localhost:3000/home/sendMessage/${receiverId}`,
        {
          message: message,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(response.data);

      const senderId = parsedToken.id;
      const senderName = `${parsedToken.username}`;

      socket.emit("newMessage", {
        senderId: senderId,
        senderName: senderName,
        message: message,
        receiverId: receiverId,
      });

      // Ask for the next message
      sendMessage(receiverId);
    } catch (error) {
      console.error("Error sending message:", error.response.data);
    }
  });
}

const receiverId = 5; // Replace with the receiver's user ID
sendMessage(receiverId);
socket.on("newMessage", (data) => {
  console.log("there is a NEW message:\n", data);
});
