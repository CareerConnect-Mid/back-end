"use strict";
//-------------------------------------------------------------------------------- applyJob table aljamal
const applyJob = (sequelize, DataTypes) =>
  sequelize.define("applyJob ", {
    job_id: { type: DataTypes.INTEGER},
    applyer_id: { type: DataTypes.INTEGER},
    cv_link:  { type: DataTypes.STRING}
  });

module.exports = applyJob;
//-------------------------------------------------------------------------------- applyJob table aljamal
