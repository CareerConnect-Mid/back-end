"use strict";

const express = require("express");
const dataModules = require("../models");
const bearerAuth = require("../auth/middleware/bearer");
const permissions = require("../auth/middleware/acl");
const {users,posts,jobcomments,jobs,comments}=require('../models/index')

const router = express.Router();

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
router.put("/:model/:id", bearerAuth, permissions("update"), handleUpdate);
router.delete("/:model/:id", bearerAuth, permissions("delete"), handleDelete);
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
router.get('/jobs/:id/jobcomments',bearerAuth, jobComments);
router.get('/posts/:id/comments',bearerAuth, postComments);

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
