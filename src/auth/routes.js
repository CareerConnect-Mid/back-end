"use strict";

const express = require("express");
const authRouter = express.Router();

const { users } = require("../../src/models/index");
const basicAuth = require("./middleware/basic.js");
const bearerAuth = require("./middleware/bearer.js");
const permissions = require("./middleware/acl.js");
const { userModel } = require("../models/index");

authRouter.post("/signup", async (req, res, next) => {
  try {
    let userRecord = await users.create(req.body);
    const output = {
      user: userRecord.username,
      role: userRecord.role,
    };
    res.status(201).json(output);
  } catch (e) {
    next(e.message);
  }
});

authRouter.post("/signin", basicAuth, (req, res, next) => {
  try {
    const user = {
      username: req.user.username,
      token: req.user.token,
      role: req.user.role,
    };
    res.status(200).json(user);
  } catch (e) {
    next(e.message);
  }
});

authRouter.get(
  "/users",
  bearerAuth,
  async (req, res, next) => {
    const userRecords = await users.get();
    const list = userRecords.map((user) => user.username);
    res.status(200).json(list);
  }
);

//------------------Logout-----------------

authRouter.post("/logout", bearerAuth, async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ").pop();
    const validUser = await userModel.authenticateToken(token);

    if (!validUser) {
      return next(new Error("Invalid user"));
    }

    validUser.isTokenBlacklisted = true;
    await validUser.save();

    res.status(200).json({ message: "Logout successful" });
  } catch (e) {
    next(e);
  }
});

module.exports = authRouter;
