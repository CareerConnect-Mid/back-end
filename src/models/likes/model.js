'use strict'

// const Likes= (Sequelize, DataTypes)=>
//     Sequelize.define("likes",{
//         post_id:{
//             type:DataTypes.INTEGER,
//             required:true
//         },
//         job_id:{
//             type:DataTypes.INTEGER,
//             required:true
//         },
//         user_id:{
//             type: DataTypes.INTEGER,
//             required:true
//         }
//     })

const Likes = (Sequelize, DataTypes) => 
  Sequelize.define('likes', {
    post_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'post_id'],
      }
    ]
  });



module.exports= Likes