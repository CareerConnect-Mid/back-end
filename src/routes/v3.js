"use strict";
require("dotenv").config();
const express = require("express");
const { jobs } = require("../models/index");
const bearerAuth = require("../auth/middleware/bearer");
const permissions = require("../auth/middleware/checkrole");
const checkId = require("../auth/middleware/checkId");
const jwt = require("jsonwebtoken");
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

router2.get("/:model", bearerAuth, handleGetAll);
router2.get("/:model/:id", bearerAuth, handleGetOne);
router2.post("/:model", bearerAuth, permissions(), handleCreate);

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
  let userId=req.user.id;
  obj.user_id=userId
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

module.exports = router2;
