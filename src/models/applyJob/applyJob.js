"use strict";
//-------------------------------------------------------------------------------- applyJob table aljamal
const applyJobModel = (sequelize, DataTypes) =>
  sequelize.define("applyJob ", {
    job_id: { type: DataTypes.INTEGER },
    applyer_id: { type: DataTypes.INTEGER },
    company_name: { type: DataTypes.STRING },
    cv_link: { type: DataTypes.STRING },
    status: {
      type: DataTypes.ENUM("pending", "rejected", "interview"),
      defaultValue: "pending",
    },
    interviewDate: { type: DataTypes.DATE },
    interviewLocation: { type: DataTypes.STRING },
    rejectionReason: { type: DataTypes.STRING },
  });

module.exports = applyJobModel;
//-------------------------------------------------------------------------------- applyJob table aljamal
