const  {db} = require("../../core/db")
const {Model,Sequelize,DataTypes} = require('sequelize')
const {User} = require('./user')
const {RandNum} = require("../../core/util")
class Organize extends Model{

}
Organize.init({
  team_id:{
    type:DataTypes.UUID,
    defaultValue:function(){
      return RandNum()
    },
  },
  uid:{
    type:Sequelize.INTEGER
  },
  team_name:{
    type:Sequelize.STRING
  },
  level:{
    type:Sequelize.INTEGER
  },
  member_id:{
    type:Sequelize.INTEGER
  }
},{
  sequelize:db,
  tableName:"organize"
})


module.exports= {
  Organize
}



