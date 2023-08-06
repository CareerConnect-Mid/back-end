"use strict";
const { Sequelize, DataTypes } = require("sequelize");
const Collection = require("./data-collection.js");
const postsModel = require("./posts/model.js");
const commentsModel = require("./comments/model.js");
const userModel = require("../../src/auth/models/users.js");
const JobsModel = require("./jobs/model");
const jobComments = require("./jobcomments/model.js");
const likesModel = require("./likes/model.js");
const chatModel = require("./chat/model.js");
const cvModel = require("./cv/cv.js");
const joinRequestsModel = require("./joinRequests/joinRequest.model.js");
const followersModel = require("./followers/followers.js");
const favoritesModel = require('../models/favoriteposts/model.js')
const {
  friendRequestsModel,
} = require("./friendrequests/FriendRequest.model.js");
const notificationModel = require("./notification/model.js");
const FriendsModel = require("./friends/model.js");
const employeesModel = require("./employees/employees.model.js");

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
const user = userModel(sequelize, DataTypes);;
const like = likesModel(sequelize, DataTypes);
const cv = cvModel(sequelize, DataTypes);
const joinrequest = joinRequestsModel(sequelize, DataTypes);
const followers = followersModel(sequelize, DataTypes);
const favorites  = favoritesModel(sequelize,DataTypes);;
///////////////////////////////////////////// Notification Model
const notification = notificationModel(sequelize, DataTypes);
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
const chat = chatModel(sequelize, DataTypes);
const friendRequests = friendRequestsModel(sequelize, DataTypes);

user.hasMany(like, { foreignKey: "user_id" });
like.belongsTo(user, { foreignKey: "user_id" });

posts.hasMany(like, { foreignKey: "post_id" });
like.belongsTo(posts, { foreignKey: "post_id" });

user.hasMany(posts, { foreignKey: "user_id" });
posts.belongsTo(user, { foreignKey: "user_id" });

user.belongsToMany(posts, { through: favorites, foreignKey: 'user_id' });
posts.belongsToMany(user, { through: favorites, foreignKey: 'post_id' });

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

/////// friends model motasem
const friends = FriendsModel(sequelize, DataTypes); // Create the Friends model instance
user.belongsToMany(user, {
  through: friends,
  as: "friends",
  foreignKey: "user_id",
});
user.belongsToMany(user, {
  through: friends,
  as: "user",
  foreignKey: "friend_id",
});
////// friends model motasem
//------------------------------------
//----------- join requests Aljamal
joinrequest.belongsTo(user, { foreignKey: "sender_id", as: "sender" });
user.hasMany(joinrequest, {
  foreignKey: "sender_id",
  as: "sentJoinrequest",
});

joinrequest.belongsTo(user, {
  foreignKey: "receiver_id",
  as: "receiver",
});
user.hasMany(joinrequest, {
  foreignKey: "receiver_id",
  as: "receivedJoinrequest",
});

// const employees = employeesModel(sequelize, DataTypes);
// // user.hasMany(employees, {
// //   foreignKey: "company_id",
// //   as: "employees",
// // });

// // // Associate users with employees as an employee's company
// // user.belongsTo(employees, {
// //   foreignKey: "employee_id",
// //   as: "company",
// // });
// user.belongsToMany(user, {
//   through: employees,
//   as: "companyEmployees",
//   foreignKey: "company_id",
//   otherKey: "employee_id",
// });

// // Also, add the inverse association if needed (Many-to-Many)
// user.belongsToMany(user, {
//   through: employees,
//   as: "company",
//   foreignKey: "employee_id",
//   otherKey: "company_id",
// });
//----------- join requests Aljamal
//------------------------------------

//------------------------------------
//----------- followers Aljamal
followers.belongsTo(user, { foreignKey: "sender_id", as: "sender" });
user.hasMany(followers, { foreignKey: "sender_id", as: "make the follow" });

followers.belongsTo(user, { foreignKey: "receiver_id", as: "receiver" });
user.hasMany(followers, {
  foreignKey: "receiver_id",
  as: "received the follow",
});

//----------- followers Aljamal
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
  notification: new Collection(notification),
  notificationModel: notification,
  chat: chat,
  // favoritePosts : favoritePosts
  favorites : new Collection(favorites),
  favorites : favorites,
  cv: new Collection(cv),
  joinRequests: joinrequest,
  followers: followers,
  postsModel: posts,
  user: user,
  friends: friends,
};
