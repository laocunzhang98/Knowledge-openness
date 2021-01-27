const  {db} = require("../../core/db")
const {Model,Sequelize} = require('sequelize')
const {User} = require('./user')

class Article extends Model{

}
Article.init({
  id:{
    type:Sequelize.INTEGER,
    primaryKey:true,
    autoIncrement:true
  },
  title:{
    type:Sequelize.STRING
  },
  label:{
    type:Sequelize.STRING
  },
  content:{
    type:Sequelize.STRING
  },
  image:{
    type:Sequelize.STRING
  },
  fav_nums:{
    type:Sequelize.INTEGER
  },
  com_nums:{
    type:Sequelize.INTEGER
  },
  uid:{
    type:Sequelize.INTEGER
  }
},{
  sequelize:db,
  tableName:"article"
})


module.exports = {
  Article
}