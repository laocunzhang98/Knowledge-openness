const  {db} = require("../../core/db")
const {Model,Sequelize,DataTypes} = require('sequelize')
const {User} = require('./user')
class Article extends Model{

}
Article.init({
  id:{
    type: DataTypes.UUID,
    primaryKey:true,
    defaultValue: DataTypes.UUIDV4,
    unique: true,
  },
  title:{
    type:Sequelize.STRING
  },
  label:{
    type:Sequelize.STRING(20)
  },
  content:{
    type:DataTypes.TEXT
  },
  rcontent:{
    type:DataTypes.TEXT
  },
  image:{
    type:Sequelize.STRING
  },
  classify_name:{
    type:Sequelize.STRING(20)
  },
  fav_nums:{
    type:Sequelize.INTEGER,
    defaultValue:0
  },
  read_nums:{
    type:Sequelize.INTEGER,
    defaultValue:0
  },
  com_nums:{
    type:Sequelize.INTEGER,
    defaultValue:0
  },
  uid:{
    type:Sequelize.INTEGER
  },
  organize_id:{
    type:Sequelize.INTEGER
  }
},{
  sequelize:db,
  tableName:"article"
})


module.exports = {
  Article
}