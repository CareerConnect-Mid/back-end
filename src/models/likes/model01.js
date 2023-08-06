const Likes = (Sequelize, DataTypes) => 
  Sequelize.define('likes1', {
    job_id: {
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
        fields: ['user_id', 'job_id'],
      }
    ]
  });



module.exports= Likes