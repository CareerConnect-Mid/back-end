const io = require("socket.io-client");
const jwt = require("jsonwebtoken");
const readline = require("readline");
const prompt = require("prompt");

const SECRET = "secretstring";
const serverURL = "http://localhost:3000";

// Replace with your JWT token
const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Im1vaGFubmFkIiwiaWQiOjIsImlhdCI6MTY5MTQ5MjEzM30.61btwrhQ_jx5KjoMmwdiTTESkVZH5RVkIX9jDyRCS2w";

const parsedToken = jwt.verify(token, SECRET);
const userId = parsedToken.id;
const companyId = 3;
const socket = io(serverURL);

socket.on("connect", () => {
  console.log("Connected to Socket.IO server");

  // Join the company room
  socket.emit("joinCompanyRoom", {
    userId,
    companyId: companyId,
    roomType: "announcements",
  });

  // Function to send messages
  const sendMessages = () => {
    prompt.get("message", async (err, result) => {
      if (err) {
        console.error("Error getting input:", err);
        return;
      }

      const message = result.message.trim();

      if (message.toLowerCase() === "exit") {
        console.log("Exiting...");
        socket.disconnect();
        return;
      }

      // Send the message
      socket.emit("sendMessage", {
        userId,
        companyId,
        roomType: "announcements",
        message: message,
      });

      sendMessages(); // Call the function again for the next message
    });
  };

  sendMessages(); // Start sending messages
});

// Receive new messages from the server
socket.on("messageReceived", (data) => {
  console.log(`New message from ${data.senderId}: ${data.message}`);
});
