const  {db} = require("../../core/db")
const {Model,Sequelize, CITEXT} = require('sequelize')
const {Article}  = require('./article')
const {User} = require('./user')

class Label extends Model{
  static async ulabel(uid){
    const label = Label.findAll({
      where:{
        uid:uid
      }
    })
    return label
  }
}
Label.init({
  uid:Sequelize.INTEGER,
  article_id:Sequelize.INTEGER,
  label_name:Sequelize.STRING(20),
},{
  sequelize:db,
  tableName:"label"
})

