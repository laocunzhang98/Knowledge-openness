const  {db} = require("../../core/db")
const {Model,Sequelize,DataTypes} = require('sequelize')
const {User} = require('./user')
const {RandNum} = require("../../core/util")
class Organize extends Model{

}
class Orgmember extends Model{

}
Orgmember.init({
  team_id:{
    type:DataTypes.UUID,
  },
  member_id:{
    type:Sequelize.INTEGER
  },
  level:{
    type:Sequelize.INTEGER
  },
},{
  sequelize:db,
  tableName:"orgmember"
})
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
  avatar:{
    type:Sequelize.STRING,
    // defaultValue:`${global.config.Basepath}/user/tuandui.png`
  },
  total:{
    type:Sequelize.INTEGER
  },
  describe:{
    type:DataTypes.TEXT,
    defaultValue:"新建团队，邀请好友创作和交流知识"
  },
  limit_total:{
    type:Sequelize.INTEGER,
    defaultValue:50
  },
  open:{
    type:Sequelize.INTEGER
  },
  type:{
    type:Sequelize.STRING,
  }
},{
  sequelize:db,
  tableName:"organize"
})


module.exports= {
  Organize,
  Orgmember
}



