'use strict'

const Likes= (Sequelize, DataTypes)=>
    Sequelize.define("likes",{
        post_id:{
            type:DataTypes.INTEGER,
            required:true
        },
        user_id:{
            type: DataTypes.INTEGER,
            required:true
        }
    })

module.exports= Likes