"use strict";

const express = require("express");
const dataModules = require("../models");
const bearerAuth = require("../auth/middleware/bearer");
const permissions = require("../auth/middleware/acl");
const checkId = require("../auth/middleware/checkId");
const {
  user,
  users,
  posts,
  jobcomments,
  jobs,
  comments,
  friendRequests,
} = require("../models/index");

const router = express.Router();

//------------------------------------------------------
//-----------------------friend requests routes mohannad
router.post("/send-friend-request/:id", bearerAuth, SendFriendRequest);
async function SendFriendRequest(req, res) {
  try {
    // check if the users exist
    const receiverid = req.params.id;
    const senderid = req.user.dataValues.id; //from tocken

    const sender = await users.get(senderid);
    const receiver = await users.get(receiverid);

    if (!sender || !receiver) {
      return res.status(404).json({ message: "User not found." });
    }
    // check if the request is already sent so that it doesnet dublicate
    const existingRequest = await friendRequests.findOne({
      where: {
        sender_id: senderid,
        receiver_id: receiverid,
      },
    });

    if (existingRequest) {
      return res.status(400).json({ message: "Friend request already sent." });
    }

    // create the new friend request
    // Create a new friend request entry in the FriendRequest table
    await friendRequests.create({
      sender_id: senderid,
      receiver_id: receiverid,
      message: `sender`,
    });

    return res
      .status(200)
      .json({ message: "Friend request sent successfully." });
  } catch (error) {
    next("an error occured, the friend request failed");
  }
}
/*------------------*/
router.get("/received-friend-requests", bearerAuth, viewFriendRequests);
async function viewFriendRequests(req, res) {
  try {
    const receiverid = req.user.dataValues.id; //from tocken

    const receivedFriendRequests = await friendRequests.findAll({
      where: { receiver_id: receiverid },
    });

    if (receivedFriendRequests.length === 0) {
      return res.status(404).json({
        message: "No friend requests received for the specified user.",
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
/*------------------*/

// router.post("/handle-friend-request/:id", bearerAuth, handleFriendRequest);

// async function handleFriendRequest(req, res) {}

//------------------------friend requests routes mohannad
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

router.get("/:model", bearerAuth, permissions("read"), handleGetAll);
router.get("/:model/:id", bearerAuth, permissions("read"), handleGetOne);
router.post("/:model", bearerAuth, permissions("create"), handleCreate);
router.put(
  "/:model/:id",
  bearerAuth,
  checkId,
  permissions("update"),
  handleUpdate
);
router.delete(
  "/:model/:id",
  bearerAuth,
  checkId,
  permissions("delete"),
  handleDelete
);
router.get(
  "/jobs/:id/jobcomments",
  bearerAuth,
  permissions("read"),
  jobComments
);
router.get(
  "/posts/:id/comments",
  bearerAuth,
  permissions("read"),
  postComments
);
router.get("/jobs/:id/jobcomments", bearerAuth, jobComments);
router.get("/posts/:id/comments", bearerAuth, postComments);

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

router.get("/users/:id/:model", bearerAuth, permissions("read"), userRecords);

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

module.exports = router;
