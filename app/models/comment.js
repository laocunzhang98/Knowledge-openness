const {db}  =  require("../../core/db")
const {Model,Sequelize,DataTypes} = require("sequelize")



class Comment extends Model{

}

Comment.init({
  article_id:{
    type:DataTypes.UUID
  },
  article_uid:{
    type:Sequelize.INTEGER
  },
  uid:{
    type:Sequelize.INTEGER
  },
  oid:{
    type:Sequelize.INTEGER
  },
  content:{
    type:Sequelize.STRING
  }
},{
  sequelize:db
})


module.exports = {
  Comment
}

