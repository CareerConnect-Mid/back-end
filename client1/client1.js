const io = require("socket.io-client");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const socket = io("http://localhost:3000");
const SECRET = "secretstring";
const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Im1vaGFubmFkIiwiaWQiOjIsImlhdCI6MTY5MDk2NDg2MH0.u4ObuIA6GvwESZ1BBR-IdwiA0eJNrEK2gaO55QwLotU";
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
        message: message,
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
const senderId = parsedToken.id;
const senderName = `${parsedToken.username}`;
const message = `you have a new friend request from ${senderName}`;
const receiverId = 3; // Replace with the receiver's user ID
sendFriendRequest(senderId, senderName, message, receiverId);

// async function sendmessage(senderId, senderName, message, receiverId) {
//   try {
//     //     // Make an HTTP POST request to the server route for sending friend requests
//     const response = await axios.post(
//       `http://localhost:3000/career/sendMessage/${receiverId}`,
//       {
//         message: " hello , this is a message from mohannad",
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );

//     console.log(response.data);
//     socket.emit("newMessage", {
//       senderId: senderId,
//       senderName: senderName,
//       message: message,
//       receiverId: receiverId,
//     });
//   } catch (error) {
//     console.error("Error sending friend request:", error.response.data);
//   }
// }
// const senderId = parsedToken.id;
// const senderName = `${parsedToken.username}`;
// const message = `hello , this is a message from ${senderName}`;
// const receiverId = 6; // Replace with the receiver's user ID
// sendmessage(senderId, senderName, message, receiverId);
