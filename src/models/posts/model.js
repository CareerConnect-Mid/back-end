"use strict";

const postsModel = (sequelize, DataTypes) =>
  sequelize.define("posts", {
    user_id: { type: DataTypes.INTEGER, required: true },
    paragraph_content: { type: DataTypes.STRING },
    photo_content: { type: DataTypes.STRING },
   
  });

module.exports = postsModel;
