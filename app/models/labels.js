const  {db} = require("../../core/db")
const {Model,Sequelize} = require('sequelize')
const {Article}  = require('./article')

class Labels extends Model{

}
Labels.init({
  label_name:Sequelize.STRING(20),
},{
  sequelize:db,
  tableName:"labels"
})

