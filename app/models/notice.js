const  {db} = require("../../core/db")
const {Model,Sequelize,DataTypes} = require('sequelize')

class Notice extends Model{
  static async link(uid,socket_id){
    const notice = await Notice.findOne({
      where:{
        uid
      }
    })
    if(notice){
      await Notice.update({online:1,uid:uid,socket_id:socket_id},{
        where:{
          uid:uid
        }
      })
    }
    else{
      if(!uid){
        return
      }
      await Notice.create({
        uid,
        socket_id,
        online:1
      })
    }
  }
  static async find(uid){
    const notice = await Notice.findOne({
      where:{
        uid:uid,
      }
    })
    return notice
  }
  static async Offline(socket_id){
    await Notice.update({online:0},{
      where:{
        socket_id:socket_id
      },
    })
  }
}
class NoticeInfo extends Model{
  static async createInfo(type,sponsor,receiver,article_id,notice_info,consult){
    await NoticeInfo.create({
      type,
      sponsor,
      receiver,
      target_id:article_id,
      notice_info,
      consult
    })
  }
}
NoticeInfo.init({
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
},{
  sequelize:db,
  tableName:"noticeinfo"
})
Notice.init({
  uid:{
    type:Sequelize.INTEGER
  },
  socket_id:{
    type:Sequelize.STRING
  },
  online:{
    type:Sequelize.INTEGER
  }
},{
  sequelize:db,
  tableName:"notice"
})


module.exports = {
  Notice,
  NoticeInfo
}