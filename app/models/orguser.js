const  {db} = require("../../core/db")
const {Model,Sequelize,DataTypes} = require('sequelize')
const {User} = require('./user')
const {RandNum} = require("../../core/util")
class Orguser extends Model{

}

Orguser.init({
  member_id:{
    type:Sequelize.INTEGER
  },
  org_id:{
    type:Sequelize.INTEGER
  },
  level:{
    type:Sequelize.INTEGER,
    defaultValue:8
  }
})


