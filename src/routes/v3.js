"use strict";
require("dotenv").config();
const express = require("express");
const { jobs,jobcomments } = require("../models/index");
const bearerAuth = require("../auth/middleware/bearer");
const permissions = require("../auth/middleware/checkrole");
const checkId = require("../auth/middleware/checkId");
const jwt = require("jsonwebtoken");
const { where } = require("sequelize");
const dataModules = { jobs };

const router2 = express.Router();

router2.param("model", (req, res, next) => {
  const modelName = req.params.model;
  if (dataModules[modelName]) {
    req.model = dataModules[modelName];
    next();
  } else {
    next("Invalid Model");
  }
});

router2.get("/jobs", bearerAuth, handleGetAll);
router2.get("/jobs/:id", bearerAuth, handleGetOne);
router2.get("/jobtitle/:title", bearerAuth, handleGetTitle);
router2.get("/jobcity/:title", bearerAuth, handleGetCIty);
router2.post("/jobs", bearerAuth, permissions(), handleCreate);
router2.get("/jobs/:id/jobcomments", bearerAuth, jobComments);
router2.put(
  "/:model/:id",
  bearerAuth,
  checkId,
  permissions(),
  handleUpdate
);
router2.delete(
  "/:model/:id",
  bearerAuth,
  checkId,
  permissions(),
  handleDelete
);

async function handleGetAll(req, res) {
  let allRecords = await jobs.get();
  res.status(200).json(allRecords);
}

async function handleGetOne(req, res) {
  const id = req.params.id;
  let theRecord = await jobs.get(id);
  res.status(200).json(theRecord);
}
async function handleGetTitle(req, res) {

  // if(!parseInt(req.params.title)){
    const title = req.params.title

    let theRecord = await jobs.getJobTitle(title);
    res.status(200).json(theRecord);
  // }
  // else if(parseInt(req.params.title)){
  //   const title = req.params.title;
  // // console.log("model ========>", typeof(title))

  //     let theRecord = await req.model.get(title);
  //     res.status(200).json(theRecord);
  // }
}
async function handleGetCIty(req, res) {


    const title = req.params.title

    let theRecord = await jobs.getJobCity(title);
    res.status(200).json(theRecord);
  
}
async function jobComments(req, res) {
  const jobId = parseInt(req.params.id);
  let jcomments = await jobs.getUserPosts(jobId, jobcomments.model);
  res.status(200).json(jcomments);
}
async function handleCreate(req, res) {
  let obj = req.body;
  let userId=req.user.id;
  obj.user_id=userId
  let newRecord = await jobs.create(obj);
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

module.exports = router2;
