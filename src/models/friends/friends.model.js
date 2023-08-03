"use strict";
//-------------------------------------------------------------------------------- friends mohannad
const friends = (sequelize, DataTypes) =>
  sequelize.define("friends", {
    personId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    friendId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  });

module.exports = { friendsModel: friends };
//-------------------------------------------------------------------------------- friends mohannad
