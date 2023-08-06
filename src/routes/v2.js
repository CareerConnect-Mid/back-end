"use strict";
require("dotenv").config();
const express = require("express");
const dataModules = require("../models");
const bearerAuth = require("../auth/middleware/bearer");
const permissions = require("../auth/middleware/acl");
const checkId = require("../auth/middleware/checkId");
const jwt = require("jsonwebtoken");
const SECRET = process.env.SECRET || "secretstring";
const port = process.env.PORT || 3001;
const { Sequelize } = require("sequelize");
const userupdate = require("../auth/middleware/adminupdate");
const { Op } = require("sequelize");
const { OPEN_PRIVATECACHE } = require("sqlite3");
const {
  userModel,
  users,
  posts,
  postsModel,
  jobcomments,
  jobs,
  comments,
  friendRequests,
  likes,
  friends,
  notification,
  notificationModel,
  chat,
  cv,
  joinRequests,
  followers,
  employees,
} = require("../models/index");

const router = express.Router();

router.get("/", welcomeHandler);
function welcomeHandler(req, res) {
  res.status(200).send("Welcome to CareerConnect");
}

////////////////////////////// Notification model
router.get("/usernotification", bearerAuth, userNotifications);

async function userNotifications(req, res) {
  const userId = req.user.id;

  let notifications = await notificationModel.findAll({
    where: {
      receiver_id: userId,
    },
  });

  res.status(200).json(notifications);
}

///////////////////////////// Notification model

///////////////////////////////////////////////////////////////////////// private and public posts motasem
router.get("/showposts", bearerAuth, handleShowPosts);

async function handleShowPosts(req, res) {
  const userId = req.user.id;

  try {
    // 1. Fetch your friends' IDs based on accepted friend requests
    const friendRequestsReceived = await friendRequests.findAll({
      where: {
        receiver_id: userId,
        status: "accepted",
      },
    });

    const friendIds = friendRequestsReceived.map(
      (request) => request.sender_id
    );

    // 2. Fetch private posts of yourself and your friends
    const privatePosts = await postsModel.findAll({
      where: {
        status: "private",
        [Op.or]: [{ user_id: userId }, { user_id: { [Op.in]: friendIds } }],
      },
    });

    // 3. Fetch public posts
    const publicPosts = await postsModel.findAll({
      where: { status: "public" },
    });

    res.status(200).json({ privatePosts, publicPosts });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching posts." });
  }
}

///////////////////////////////////////////////////////////////////////// private and public posts motasem
//------------------------------------------------------
//-----------------------friend requests routes mohannad
router.post("/send-friend-request/:id", bearerAuth, sendFriendRequest);
async function sendFriendRequest(req, res) {
  const userId = req.user.id;
  const friendId = req.params.id;
  try {
    const user = await userModel.findByPk(userId);
    if (user.role === "company") {
      return res
        .status(400)
        .json({ message: "Companies cannot send friend requests." });
    }

    // Check if the user you are sending the request to is a company
    const friendUser = await userModel.findByPk(friendId);
    if (friendUser.role === "company") {
      return res
        .status(400)
        .json({ message: "You cannot send friend requests to companies." });
    }

    const existingRequestFromSender = await friendRequests.findOne({
      where: {
        sender_id: userId,
        receiver_id: friendId,
      },
    });

    // Check if there is an existing friend request from receiver to sender
    const existingRequestFromReceiver = await friendRequests.findOne({
      where: {
        sender_id: friendId,
        receiver_id: userId,
      },
    });
    const areFriends = await friends.findOne({
      where: {
        user_id: userId,
        friend_id: friendId,
      },
    });
    if (areFriends) {
      return res.status(400).json({
        message: "you are already friends",
      });
    } else if (existingRequestFromSender || existingRequestFromReceiver) {
      return res.status(400).json({
        message: "there is a pending friend request between both of you",
      });
    }
    // Create a new friend request
    await friendRequests.create({ sender_id: userId, receiver_id: friendId });
    return res
      .status(200)
      .json({ message: "Friend request sent successfully." });
  } catch (error) {
    console.error("Error sending friend request:", error);
    res
      .status(500)
      .json({ message: "An error occurred while sending friend request." });
  }
}

router.get("/friends", bearerAuth, Friends);
async function Friends(req, res) {
  const friendsReq = await friends.findAll();
  res.status(200).json(friendsReq);
}
router.get("/friendsreq", bearerAuth, Friendsreq);
async function Friendsreq(req, res) {
  const friendsReq = await friendRequests.findAll();
  res.status(200).json(friendsReq);
}
router.get("/my-friends", bearerAuth, getFriendsWithNames);

async function getFriendsWithNames(req, res) {
  const userId = req.user.id;

  try {
    // 1. Fetch your friends' IDs based on accepted friend requests
    const friendRequestsReceived = await friendRequests.findAll({
      where: {
        receiver_id: userId,
        status: "accepted",
      },
    });

    const friendIds = friendRequestsReceived.map(
      (request) => request.sender_id
    );

    // 2. Fetch the friend users' records including their names
    const friendsWithNames = await userModel.findAll({
      where: {
        id: { [Op.in]: friendIds },
      },
      attributes: ["id", "username"],
    });

    res.status(200).json(friendsWithNames);
  } catch (error) {
    console.error("Error fetching friends with names:", error);
    res.status(500).json({
      message: "An error occurred while fetching friends with names.",
    });
  }
}
//////////////////////////////////////////////////////////////////////////////////////// friends routes motasem

// /*------------------*/

router.get("/myfriends", bearerAuth, getFriends);

async function getFriends(req, res) {
  try {
    const userId = req.user.dataValues.id; // Get the user ID from the authenticated user's token

    // Find the user by ID and include their friends using the "friends" association
    const user = await userModel.findByPk(userId, {
      include: [
        {
          association: "friends",
          attributes: [
            "id",
            "username",
            "firstName",
            "lastName",
            "profilePicture",
          ],
        },
      ],
    });

    // Extract only the friends from the user object
    const friends = user.friends;

    return res.status(200).json(friends);
  } catch (error) {
    console.error("Error retrieving friends:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while retrieving friends." });
  }
}

// /*------------------*/
router.get("/received-friend-requests", bearerAuth, viewFriendRequests);
async function viewFriendRequests(req, res) {
  try {
    const receiverid = req.user.dataValues.id; //from tocken

    const receivedFriendRequests = await friendRequests.findAll({
      where: {
        receiver_id: receiverid,
        status: "pending", // Filter by status: "pending"
      },
    });

    if (receivedFriendRequests.length === 0) {
      return res.status(404).json({
        message: "No pendin friend requests .",
      });
    }
    return res.status(200).json(receivedFriendRequests);
  } catch (error) {
    console.error("Error retrieving received friend requests:", error);
    return res.status(500).json({
      message: "An error occurred while retrieving received friend requests.",
    });
  }
}
// /*------------------*/

router.post("/handle-friend-request/:id", bearerAuth, handleFriendRequest);

async function handleFriendRequest(req, res) {
  const userId = req.user.id;
  const senderid = req.params.id;
  const { action } = req.body;

  const friendRequest = await friendRequests.findOne({
    where: {
      sender_id: senderid,
    },
  });
  if (!friendRequest) {
    return res.status(404).json({ message: "Friend request not found." });
  }

  if (action === "accept") {
    friendRequest.status = "accepted";

    // Save the updated status in the database
    await friendRequest.save();

    // Create friendship records

    await friends.create({ user_id: userId, friend_id: senderid });
    await friends.create({ user_id: senderid, friend_id: userId });
  } else if (action === "decline") {
    friendRequest.status = "declined";
    // Remove the friend request record from the database
    await friendRequest.destroy();
  } else {
    return res.status(400).json({ message: "Invalid action." });
  }

  return res.status(200).json({
    message: `Friend request is ${friendRequest.status} successfully.`,
  });
}

//------------------------friend requests routes mohannad
//------------------------------------------------------

//------------------------------------------------------
//-----------------------JOIN requests routes aljamal
router.post("/handle-join-request/:id", bearerAuth, handleFriendRequest);

async function handleFriendRequest(req, res) {
  const userId = req.user.id;
  const senderid = req.params.id;
  const { action } = req.body;

  const joinRequest = await joinRequests.findOne({
    where: {
      sender_id: senderid,
    },
  });
  if (!joinRequest) {
    return res.status(404).json({ message: "Friend request not found." });
  }

  if (action === "accept") {
    joinRequest.status = "accepted";

    // Save the updated status in the database
    await joinRequest.save();
    await employees.create({
      company_id: userId,
      employee_id: senderid,
    });

    await userModel.update(
      { employed: true },
      {
        where: {
          id: senderid,
        },
      }
    );

    // Create friendship records
  } else if (action === "decline") {
    joinRequest.status = "declined";
    // Remove the friend request record from the database
    await joinRequest.destroy();
  } else {
    return res.status(400).json({ message: "Invalid action." });
  }

  return res.status(200).json({
    message: `join request is ${joinRequest.status} successfully.`,
  });
}

router.post("/send-join-request/:id", bearerAuth, SendJoinRequest);
async function SendJoinRequest(req, res, next) {
  try {
    // check if the users exist
    const receiverid = req.params.id;
    const receiver = await users.get(receiverid);
    console.log(receiverid, receiver);
    if (req.user.role !== "company" && receiver.dataValues.role == "company") {
      // check if the users exist
      const senderid = req.user.dataValues.id; //from tocken
      const sender = await users.get(senderid);

      if (!sender || !receiver) {
        return res.status(404).json("User not found.");
      }
      // check if the request is already sent so that it doesnet dublicate
      const existingRequest = await joinRequests.findOne({
        where: {
          sender_id: senderid,
          receiver_id: receiverid,
        },
      });

      if (existingRequest) {
        return res.status(400).json("Join request already sent.");
      }

      // create the new Join request
      // Create a new Join request entry in the JoinRequest table
      await joinRequests.create({
        sender_id: senderid,
        receiver_id: receiverid,
        message: `you have a join request from ${receiver.dataValues.username}`,
      });

      return res.status(200).json("Join request sent successfully.");
    } else {
      return res.status(200).json("you don't have Permission");
    }
  } catch (error) {
    next("an error occured, the Join request failed");
  }
}
/*------------------*/
router.get("/received-Join-requests", bearerAuth, viewJoinRequests);
async function viewJoinRequests(req, res, next) {
  try {
    if (req.user.dataValues.role == "company") {
      const receiverid = req.user.dataValues.id; //from tocken

      const receivedJoinRequests = await joinRequests.findAll({
        where: { receiver_id: receiverid },
      });

      if (receivedJoinRequests.length === 0) {
        return res.status(404).json({
          message: "No Join requests received for the specified user.",
        });
      }
      return res.status(200).json(receivedJoinRequests);
    } else {
      return res.status(200).json("you don't have Permission");
    }
  } catch (error) {
    console.error("Error retrieving received friend requests:", error);
    return res.status(500).json({
      message: "An error occurred while retrieving received friend requests.",
    });
  }
}

// router.get("/company/employees", bearerAuth, getCompanyEmployees);
// async function getCompanyEmployees(req, res) {
//   try {
//     const companyId = req.user.id; // Assuming the user ID represents the company ID

//     // Find the employees of the company using the "employees" model and include user details
//     const companyEmployees = await employees.findAll({
//       where: {
//         company_id: companyId,
//       },
//       include: [
//         {
//           model: userModel,
//           as: "employee",
//           attributes: [
//             "id",
//             "username",
//             "firstName",
//             "lastName",
//             "profilePicture",
//           ],
//         },
//       ],
//     });

//     // Extract only the employee details from the companyEmployees array
//     // const employeesDetails = companyEmployees.map(
//     //   (employee) => employee.employee
//     // );

//     return res.status(200).json(companyEmployees);
//   } catch (error) {
//     console.error("Error getting company employees:", error);
//     return res.status(500).json({ message: "Server error." });
//   }
// }

//------------------------JOIN requests routes aljamal
//------------------------------------------------------

//------------------------------------------------------
//-----------------------Followers routes aljamal

router.post("/makefollow/:id", bearerAuth, makeFollow);
async function makeFollow(req, res, next) {
  try {
    // check if the users exist
    const receiverid = req.params.id;
    const receiver = await users.get(receiverid);

    if (req.user.role !== "company" && receiver.dataValues.role == "company") {
      // check if the users exist
      const senderid = req.user.dataValues.id; //from tocken
      const sender = await users.get(senderid);

      if (!sender || !receiver) {
        return res.status(404).json("User not found.");
      }
      // check if the request is already sent so that it doesnet dublicate
      const existingRequest = await followers.findOne({
        where: {
          sender_id: senderid,
          receiver_id: receiverid,
        },
      });

      if (existingRequest) {
        return res
          .status(400)
          .json(
            `You are already follow ${receiver.dataValues.username} company`
          );
      }

      // create the new Join request
      // Create a new Join request entry in the JoinRequest table
      await followers.create({
        sender_id: senderid,
        receiver_id: receiverid,
      });

      return res
        .status(200)
        .json(`You are now following ${receiver.dataValues.username} company.`);
    } else {
      return res.status(200).json("you don't have Permission");
    }
  } catch (error) {
    next("an error occured, the Join request failed");
  }
}
/*------------------*/
router.get("/followers", bearerAuth, viewFollowers);
async function viewFollowers(req, res, next) {
  try {
    if (req.user.dataValues.role == "company") {
      const receiverid = req.user.dataValues.id; //from tocken

      const receivedFollowers = await followers.findAll({
        where: { receiver_id: receiverid },
      });

      if (receivedFollowers.length === 0) {
        return res.status(404).json("there is no followersto your company yet");
      }

      return res.status(200).json(receivedFollowers);
    } else {
      return res.status(200).json("you don't have Permission");
    }
  } catch (error) {
    console.error("Error retrieving received friend requests:", error);
    return res.status(500).json({
      message: "An error occurred while retrieving received friend requests.",
    });
  }
}
//------------------------Followers routes aljamal
//------------------------------------------------------

//------------------------------------------------------
//----------------------- Chat aljamal
router.post("/sendMessage/:id", bearerAuth, SendMessage);
async function SendMessage(req, res, next) {
  try {
    // check if the users exist
    const receiverid = req.params.id;
    const senderid = req.user.dataValues.id; //from tocken

    const sender = await users.get(senderid);
    const receiver = await users.get(receiverid);

    const sendername = req.user.dataValues.username;
    if (!sender || !receiver) {
      return res.status(404).json({ message: "User not found." });
    }

    // create new Message
    await chat.create({
      sender_id: senderid,
      receiver_id: receiverid,
      message: req.body.message,
      sender_name: sendername,
    });

    return res.status(200).json({ message: "the message sent successfully." });
  } catch (error) {
    next("an error occured, the sent message failed");
  }
}
/*------------------*/

router.get("/chat", viewAllMessages);
async function viewAllMessages(req, res) {
  const ma = await chat.findAll();
  return res.status(200).json(ma);
}

/*-----------------*/
router.get("/chat/:id", bearerAuth, viewMessages);
async function viewMessages(req, res) {
  try {
    const receiverid = req.params.id;
    const senderid = req.user.dataValues.id; //from tocken

    const receivedMessage = await chat.findAll({
      where: {
        [Sequelize.Op.or]: [
          { sender_id: senderid, receiver_id: receiverid },
          { sender_id: receiverid, receiver_id: senderid },
        ],
      },
      // order: [['timestamp', 'ASC']],
    });

    return res.status(200).json(receivedMessage);
  } catch (error) {
    console.error("Error retrieving received the messages:", error);
    return res.status(500).json({
      message: "An error occurred while retrieving received the messages.",
    });
  }
}
//------------------------Chat aljamal
//------------------------------------------------------

router.param("model", (req, res, next) => {
  const modelName = req.params.model;
  if (dataModules[modelName]) {
    req.model = dataModules[modelName];
    next();
  } else {
    next("Invalid Model");
  }
});

router.get("/cv", bearerAuth, handleGetAllCV);
router.get("/cv/:id", bearerAuth, handleGetOneCV);
router.get("/cvtitle/:title", bearerAuth, handleGetCVbyTitle);
router.get("/cvfield/:field", bearerAuth, handleGetCVbyfield);
router.get("/cv/:title/:field", bearerAuth, handleGetCVbyTitleAndField);
router.post("/cv", bearerAuth, handleCreateCV);

router.get("/:model", bearerAuth, handleGetAll);
router.get("/:model/:id", bearerAuth, handleGetOne);
router.post("/:model", bearerAuth, handleCreate);
router.post("/:model", bearerAuth, handleCreateLikes);
// router.put("/:model/:id", bearerAuth, checkId, handleUpdate);
router.put("/:model/:id", bearerAuth, userupdate, handleUpdate);
router.delete("/:model/:id", bearerAuth, checkId, handleDelete);

router.get("/jobs/:id/jobcomments", bearerAuth, jobComments);
router.get("/posts/:id/comments", bearerAuth, postComments);
router.get("/posts/:id/likes", bearerAuth, postLikes);

async function jobComments(req, res) {
  const jobId = parseInt(req.params.id);
  let jcomments = await jobs.getUserPosts(jobId, jobcomments.model);
  res.status(200).json(jcomments);
}

async function postComments(req, res) {
  const postId = parseInt(req.params.id);
  let pcomments = await posts.getUserPosts(postId, comments.model);
  res.status(200).json(pcomments);
}
async function postLikes(req, res) {
  const postId = parseInt(req.params.id);
  let pLikes = await posts.getUserPosts(postId, likes.model);
  res.status(200).json(pLikes);
}

router.get("/users/:id/:model", bearerAuth, userRecords);

async function userRecords(req, res) {
  const userId = parseInt(req.params.id);
  let userRecord = await users.getUserPosts(userId, req.model.model);
  res.status(200).json(userRecord);
}

async function jobComments(req, res) {
  const jobId = parseInt(req.params.id);
  let jcomments = await jobs.getUserPosts(jobId, jobcomments.model);
  res.status(200).json(jcomments);
}
async function postComments(req, res) {
  const postId = parseInt(req.params.id);
  let pcomments = await posts.getUserPosts(postId, comments.model);
  res.status(200).json(pcomments);
}

async function handleGetAll(req, res) {
  let allRecords = await req.model.get();
  res.status(200).json(allRecords);
}

async function handleGetOne(req, res) {
  const id = req.params.id;
  let theRecord = await req.model.get(id);
  res.status(200).json(theRecord);
}

async function handleCreate(req, res) {
  let obj = req.body;
  let userId = req.user.id;
  obj.user_id = userId;
  let newRecord = await req.model.create(obj);
  res.status(201).json(newRecord);
}
async function handleCreateLikes(req, res) {
  let obj = req.body;
  let userId = req.user.id;
  obj.user_id = userId;
  let newRecord = await req.model.create(obj);
  res.status(201).json(newRecord);
}

async function handleUpdate(req, res) {
  const id = req.params.id;
  const obj = req.body;
  let updatedRecord = await req.model.update(id, obj);
  res.status(200).json(updatedRecord);
}

async function handleDelete(req, res) {
  let id = req.params.id;
  let deletedRecord = await req.model.delete(id);
  res.status(200).json(deletedRecord);
}

//--------------------------------------------------------CV get & creat & search ---------------------------

async function handleGetAllCV(req, res) {
  if (req.user.role !== "user") {
    let allRecords = await cv.get();
    const list = allRecords.map((cv) => cv.cv_link);
    res.status(200).json(list);
  } else {
    res.status(200).json("you dont have Permission");
  }
}

async function handleGetOneCV(req, res) {
  if (req.user.role != "user" || req.params.id == req.user.id) {
    const id = req.params.id;
    let theRecord = await cv.get(id);
    res.status(200).json(theRecord.cv_link);
  } else {
    res.status(200).json("you dont have Permission");
  }
}

async function handleCreateCV(req, res) {
  if (req.user.role !== "company") {
    let obj = req.body;
    let userId = req.user.id;
    obj.user_id = userId;
    let newRecord = await cv.create(obj);
    res.status(201).json(newRecord);
  } else {
    res.status(200).json("you dont have Permission to make cv");
  }
}

async function handleGetCVbyTitle(req, res) {
  if (req.user.role != "user" || req.params.id == req.user.id) {
    const title = req.params.title;
    let theRecord = await cv.getCVbyTitle(title);
    res.status(200).json(theRecord.cv_link);
  } else {
    res.status(200).json("you dont have Permission");
  }
}

async function handleGetCVbyfield(req, res) {
  if (req.user.role != "user" || req.params.id == req.user.id) {
    const field = req.params.field;
    let theRecord = await cv.getCVbyfield(field);
    res.status(200).json(theRecord.cv_link);
  } else {
    res.status(200).json("you dont have Permission");
  }
}

async function handleGetCVbyTitleAndField(req, res) {
  if (req.user.role != "user" || req.params.id == req.user.id) {
    const title = req.params.title;
    const field = req.params.field;
    let allRecords = await cv.getCVbyTitleAndField(title, field);
    const list = allRecords.map((cv) => cv.cv_link);
    res.status(200).json(list);
  } else {
    res.status(200).json("you dont have Permission");
  }
}

module.exports = router;
