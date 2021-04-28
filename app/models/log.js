const  {db} = require("../../core/db")
const {Model,Sequelize,DataTypes} = require('sequelize')


class Log extends Model{
}
Log.init({
  uid:{
    type:Sequelize.INTEGER
  },
  // 1是文章
  // 2是文件
  category:{
    type:Sequelize.INTEGER
  },
  type:{
    type:Sequelize.STRING
  },
  target_id:{
    type:Sequelize.STRING
  },
  info:{
    type:DataTypes.TEXT
  },
  team_id:{
    type:Sequelize.INTEGER
  }
},{sequelize:db,tableName:"logs"})


module.exports = {
  Log
}