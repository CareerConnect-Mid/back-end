"use strict";
const { Sequelize, DataTypes } = require("sequelize");
const Collection = require("./data-collection.js");
const postsModel = require("./posts/model.js");
const commentsModel = require("./comments/model.js");
const userModel = require("../../src/auth/models/users.js");
const JobsModel = require("./jobs/model");
const jobComments = require("./jobcomments/model.js");
const likesModel= require('./likes/model.js');
const jobLikes= require('./likes/model01.js');
const chatModel= require('./chat/model.js');
const cvModel = require("./cv/cv.js");
const {
  friendRequestsModel,
} = require("./friendrequests/FriendRequest.model.js");
const notificationModel=require('./notification/model.js')


const POSTGRESS_URI =
  process.env.NODE_ENV === "test"
    ? "sqlite::memory:"
    : process.env.DATABASE_URL;

let sequelizeOptions =
  process.env.NODE_ENV === "production"
    ? {
        dialectOptions: {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
        },
      }
    : {};
let sequelize = new Sequelize(POSTGRESS_URI, sequelizeOptions);

const posts = postsModel(sequelize, DataTypes);
const jobcomments = jobComments(sequelize, DataTypes);
const comment = commentsModel(sequelize, DataTypes);
const jobs = JobsModel(sequelize, DataTypes);
const user=userModel(sequelize,DataTypes);
const like=likesModel(sequelize,DataTypes);
const joblikes=jobLikes(sequelize,DataTypes);
const cv = cvModel(sequelize, DataTypes);
///////////////////////////////////////////// Notification Model
const notification=notificationModel(sequelize,DataTypes)
notification.belongsTo(user, { foreignKey: "sender_id", as: "sender" });
user.hasMany(notification, {
  foreignKey: "sender_id",
  as: "sentnotifications",
});
notification.belongsTo(user, {
  foreignKey: "receiver_id",
  as: "receiver",
});
user.hasMany(notification, {
  foreignKey: "receiver_id",
  as: "receivednotifications",
});
notification.belongsTo(posts, { foreignKey: "post_id" });
posts.hasMany(notification, { foreignKey: "post_id" });
notification.belongsTo(jobs, { foreignKey: "job_id" });
jobs.hasMany(notification, { foreignKey: "job_id" });
notification.belongsTo(jobcomments, { foreignKey: "job_comment_id" });
jobcomments.hasMany(notification, { foreignKey: "job_comment_id" });
notification.belongsTo(comment, { foreignKey: "comment_id" });
comment.hasMany(notification, { foreignKey: "comment_id" });
//////////////////////////////////////////// Notification Model
const chat=chatModel(sequelize,DataTypes)
const friendRequests = friendRequestsModel(sequelize, DataTypes);

user.hasMany(like,{foreignKey:"user_id"});
like.belongsTo(user,{foreignKey:"user_id"})

posts.hasMany(like,{foreignKey:"post_id"});
like.belongsTo(posts,{foreignKey:"post_id"})

jobs.hasMany(joblikes,{foreignKey:"job_id"});
joblikes.belongsTo(jobs,{foreignKey:"job_id"})


user.hasMany(posts, { foreignKey: "user_id" });
posts.belongsTo(user, { foreignKey: "user_id" });

jobs.hasMany(jobcomments, { foreignKey: "job_id" });
jobcomments.belongsTo(jobs, { foreignKey: "job_id" });

posts.hasMany(comment, { foreignKey: "post_id" });
comment.belongsTo(posts, { foreignKey: "post_id" });

user.hasMany(jobs, { foreignKey: "user_id" });
jobs.belongsTo(user, { foreignKey: "user_id" });

user.hasMany(cv, { foreignKey: "user_id" });
cv.belongsTo(user, { foreignKey: "user_id" });

//------------------------------------
//----------- friend requests mohannad
friendRequests.belongsTo(user, { foreignKey: "sender_id", as: "sender" });
user.hasMany(friendRequests, {
  foreignKey: "sender_id",
  as: "sentFriendRequests",
});

friendRequests.belongsTo(user, {
  foreignKey: "receiver_id",
  as: "receiver",
});
user.hasMany(friendRequests, {
  foreignKey: "receiver_id",
  as: "receivedFriendRequests",
});

//----------- friend requests mohannad
//------------------------------------


//------------------------------------
//----------- chat aljamal
chat.belongsTo(user, { foreignKey: "sender_id", as: "sender" });
user.hasMany(chat, {
  foreignKey: "sender_id",
  as: "sentMessage",
});

chat.belongsTo(user, {
  foreignKey: "receiver_id",
  as: "receiver",
});
user.hasMany(chat, {
  foreignKey: "receiver_id",
  as: "receivedMessage",
});

//----------- chat aljamal
//------------------------------------


module.exports = {
  db: sequelize,
  posts: new Collection(posts),
  comments: new Collection(comment),
  users: new Collection(user),
  jobcomments: new Collection(jobcomments),
  jobs: new Collection(jobs),
  userModel: user,
  likes: new Collection(like),
  friendRequests: friendRequests,
  notification:new Collection(notification),
  notificationModel:notification,
  chat: chat,
  cv: new Collection(cv),
  joblike: new Collection(joblikes)
};
