const  {db} = require("../../core/db")
const {Model,Sequelize,DataTypes} = require('sequelize')

class ApplyInfo extends Model{
  static async handleApply(notice_info,sponsor,target_id){
    ApplyInfo.update({notice_info},{where:{
      sponsor,
      target_id
    }})
  }
}
ApplyInfo.init({
  type:{
    type:Sequelize.STRING
  },
  sponsor:{
    type:Sequelize.INTEGER
  },
  receiver:{
    type:Sequelize.INTEGER
  },
  target_id:{
    type:Sequelize.STRING
  },
  consult:{
    type:Sequelize.INTEGER
  },
  notice_info:{
    type:DataTypes.TEXT
  }
},{sequelize:db})


module.exports = {
  ApplyInfo
}