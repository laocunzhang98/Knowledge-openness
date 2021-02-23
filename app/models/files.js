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
    defaultValue:""
  },
  origin_name:{
    type:Sequelize.STRING,
    defaultValue:""
  },
  origin_path:{
    type:Sequelize.STRING,
    defaultValue:""
  },
  organize_id:{
    type:Sequelize.INTEGER,
    defaultValue:0
  },
  parent_fileid:{
    type:Sequelize.INTEGER,
    defaultValue:""
  },
  parent_filename:{
    type:Sequelize.STRING,
    defaultValue:""
  },
  mimetype:{
    type:Sequelize.STRING,
    defaultValue:"dir"
  },
  size:{
    type:Sequelize.INTEGER,
    defaultValue:0
  }
},{
  sequelize:db,
  tableName:"files"
})


module.exports = {
  Files
}