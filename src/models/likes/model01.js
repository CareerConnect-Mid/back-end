const Likes = (Sequelize, DataTypes) =>
  Sequelize.define("likes1", {
    job_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  });

module.exports = Likes;
