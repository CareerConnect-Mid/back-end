"use strict";

const JobsModel = (sequelize, DataTypes) =>
  sequelize.define("jobs", {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    job_title: {
      type: DataTypes.STRING(255),
    },
    job_city: {
      type: DataTypes.STRING(255),
    },
    job_field: {
      type: DataTypes.STRING(255),
    },
    job_post_content: {
      type: DataTypes.STRING(255),
    },
  });

module.exports = JobsModel;
