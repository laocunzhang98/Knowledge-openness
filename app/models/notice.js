const  {db} = require("../../core/db")
const {Model,Sequelize} = require('sequelize')

class Notice extends Model{
  static async link(uid,socket_id){
    const notice = await Notice.findOne({
      where:{
        uid
      }
    })
    if(notice){
      await Notice.update({uid:uid,socket_id:socket_id},{
        where:{
          uid:uid
        }
      })
    }
    else{
      await Notice.create({
        uid,
        socket_id
      })
    }
  }
  static async find(uid){
    const notice = await Notice.findOne({
      where:{
        uid:uid
      }
    })
    return notice.socket_id
  }
  static async deluid(socket_id){
    const del = await Notice.destroy({
      where:{
        socket_id:socket_id
      },
    })
  }
}
class NoticeInfo extends Model{

}
NoticeInfo.init({
  socket_id:{
    type:Sequelize.STRING
  },
  notice_info:{
    type:Sequelize.STRING
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
  }
},{
  sequelize:db,
  tableName:"notice"
})


module.exports = {
  Notice,
  NoticeInfo
}