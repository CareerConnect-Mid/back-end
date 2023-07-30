"use strict";
//-------------------------------------------------------------------------------- friend requests table mohannad
const friendRequests = (sequelize, DataTypes) =>
  sequelize.define("friendRequests ", {
    sender_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    receiver_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("bending", "accepted", "declined"),
      required: true,
      defaultValue: "bending",
    },
    message: { type: DataTypes.STRING },
  });

module.exports = { friendRequestsModel: friendRequests };
//-------------------------------------------------------------------------------- friend requests table mohannad
