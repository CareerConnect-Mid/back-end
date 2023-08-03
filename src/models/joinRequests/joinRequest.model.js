"use strict";
//-------------------------------------------------------------------------------- join requests table aljamal
const joinRequests = (sequelize, DataTypes) =>
  sequelize.define("joinRequests ", {
    sender_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    receiver_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "accepted", "declined"),
      required: true,
      defaultValue: "pending",
    },
    message: { type: DataTypes.STRING },
  });

module.exports = joinRequests;
//-------------------------------------------------------------------------------- join requests table aljamal
