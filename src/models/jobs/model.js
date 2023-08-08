"use strict";

const JobsModel = (sequelize, DataTypes) =>
  sequelize.define("jobs", {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    username:{type:DataTypes.STRING},
    job_title: {
      type: DataTypes.STRING(255),
      set(value) {
        this.setDataValue("job_title", value.toLowerCase());
      }
    },
    job_city: {
      type: DataTypes.STRING(255),
    },
    job_field: {
      type: DataTypes.STRING(255),
    },
   content: {
      type: DataTypes.STRING(255),
    },
  });

module.exports = JobsModel;
