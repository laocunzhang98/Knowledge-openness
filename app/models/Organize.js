const  {db} = require("../../core/db")
const {Model,Sequelize,DataTypes} = require('sequelize')
const {User} = require('./user')
const {RandNum} = require("../../core/util")
class Organize extends Model{

}
Organize.init({
  id:{
    type:DataTypes.UUID,
    defaultValue:function(){
      return RandNum()
    },
    primaryKey:true,
    unique: true,
  },
  uid:{
    type:Sequelize.INTEGER
  },
  circle_name:{
    type:Sequelize.STRING
  }
},{
  sequelize:db,
  tableName:"organize"
})


module.exports= {
  Organize
}



