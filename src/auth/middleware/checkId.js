"use strict";

const { userModel } = require("../../models/index");
const { posts } = require("../../models/index");

module.exports = async (req, res, next) => {
  try {
    const postId = await posts.get(req.params.id);
    const postUserId = postId["dataValues"].user_id;
    const userId = req.user.dataValues.id;

    if (postUserId === userId) {
      next();
    } else {
      next("not allowed");
    }
  } catch (error) {
    next("not allowed");
  }
};
