const  {db} = require("../../core/db")
const {Model,Sequelize,DataTypes} = require('sequelize')
const {User} = require('./user')
class Files extends Model{

}

Files.init({
  uid:{
    type:Sequelize.INTEGER,
  },
  filename:{
    type:Sequelize.STRING,
  },
  origin_name:{
    type:Sequelize.STRING,
  },
  organize_id:{
    type:Sequelize.INTEGER,
  }
},{
  sequelize:db,
  tableName:"files"
})


module.exports = {
  Files
}