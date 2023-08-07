const io = require("socket.io-client");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const SECRET = "secretstring";
const readline = require("readline");

const socket = io("http://localhost:3000");
const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFobWVkIiwiaWQiOjgsImlhdCI6MTY5MTMwODY0NH0.QE7wv1pcxgtT7S2AUEj8FS1fO1prQ_2WDQ7PaeA6n0k";
socket.on("connect", () => {
  console.log("Connected to Socket.IO server");
  socket.emit("sendToken", { token });
});
const parsedToken = jwt.verify(token, SECRET);
// Listen for the friendRequestNotification event from the server
// socket.on("friendRequest", (data) => {
//   console.log("Received friend request notification:", data);
//   handleFriendRequest(data);
// });

// async function handleFriendRequest(data) {
//   // Make an HTTP POST request to the server route for sending friend requests
//   const response = await axios.post(
//     `http://localhost:3000/career/handle-friend-request/${data.senderId}`,
//     {
//       action: "accept",
//     },
//     {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     }
//   );

//   console.log(response.data);
//   socket.emit("friendRequestHandled", {
//     senderId: parsedToken.id,
//     senderName: senderName,
//     receiverId: data.senderId,
//     message: "the friend request is accepted ",
//   });
// }

// const senderId = parsedToken.id;
// const senderName = `${parsedToken.username}`;
// const message = `you have a new friend request from ${senderName}`;
// const receiverId = 2; // Replace with the receiver's user ID

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function sendMessage(receiverId) {
  // rl.setPrompt("Enter your message: ");
  // console.log(`You:`); // Prefix your own messages
  rl.prompt();

  rl.on("line", async (message) => {
    try {
      const response = await axios.post(
        `http://localhost:3000/career/sendMessage/${receiverId}`,
        {
          message: message,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      readline.clearLine(process.stdout, 0); // Clear the current line
      readline.cursorTo(process.stdout, 0); // Move the cursor to the beginning of the line

      const senderId = parsedToken.id;
      const senderName = `${parsedToken.username}`;

      socket.emit("newMessage", {
        senderId: senderId,
        senderName: senderName,
        message: message,
        receiverId: receiverId,
      });

      rl.prompt(); // Ask for the next message
    } catch (error) {
      console.error("Error sending message:", error.response.data);
    }
  });
}

const receiverId = 1; // Replace with the receiver's user ID
sendMessage(receiverId);

socket.on("newMessage", (data) => {
  readline.clearLine(process.stdout, 0); // Clear the current line
  readline.cursorTo(process.stdout, 0); // Move the cursor to the beginning of the line

  if (data.senderId !== parsedToken.id) {
    console.log(`${data.senderName}: ${data.message}`); // Display other users' messages
  }

  rl.prompt(); // Ask for the next message
});
