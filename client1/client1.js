const io = require("socket.io-client");
const axios = require("axios");

const socket = io("http://localhost:3000");
const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InJlcyIsImlkIjoyLCJpYXQiOjE2OTA3OTE2NTF9.tCwQbcHUKjsibV0maAcFf1AKAutnh43p492DPDBAAIs";
socket.on("connect", () => {
  console.log("Connected to Socket.IO server");
  socket.emit("sendToken", { token });
});

async function sendFriendRequest(senderId, senderName, message, receiverId) {
  try {
    // Make an HTTP POST request to the server route for sending friend requests
    const response = await axios.post(
      `http://localhost:3000/api/v2/send-friend-request/${receiverId}`,
      {
        message: " hello friend request",
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log(response.data); // Log the response from the server (optional)
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
const senderId = 1; // Replace with the sender's user ID
const senderName = "Sender's Username"; // Replace with the sender's username
const message = "Hello, let's be friends!"; // Replace with the friend request message
const receiverId = 9; // Replace with the receiver's user ID
sendFriendRequest(senderId, senderName, message, receiverId);
