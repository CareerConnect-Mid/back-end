"use strict";
//-------------------------------------------------------------------------------- friend requests table mohannad
const friendRequests = (sequelize, DataTypes) => {
  const model = sequelize.define("friendRequests ", {
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

  // model.afterUpdate(async (requestToUpdate) => {
  //   if (requestToUpdate.status === "accepted") {
  //     // Create a friendship record in the Friendship table
  //     const friends = sequelize.models.friends;
  //     await friends.create({
  //       personId: requestToUpdate.sender_id,
  //       friendId: requestToUpdate.receiver_id,
  //     });

  //     await friends.create({
  //       personId: requestToUpdate.receiver_id,
  //       friendId: requestToUpdate.sender_id,
  //     });
  //   }
  // });
  return model;
};

module.exports = { friendRequestsModel: friendRequests };
//-------------------------------------------------------------------------------- friend requests table mohannad
