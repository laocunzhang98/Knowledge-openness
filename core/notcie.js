const {Notice,NoticeInfo} = require("../app/models/notice")
monitor = async function(socket,io){
  console.log("连接成功！")
  await socket.on("disconnect",async ()=>{
    console.log("断开连接")
    // console.log(socket.id)
    await Notice.Offline(socket.id)
  })
  // 评论通信
  await socket.on("comment",async (val)=>{
    console.log(val)
    let id,type,sponsor,receiver,article_id,consult,content
    if(val.oid==0){
      id = val.article_uid
      type = "评论"
    }
    else{
      id = val.oid
      type = "回复"
    }
    sponsor = val.uid
    receiver = id
    content = val.content
    // 本人回复本人不提醒
    if(sponsor == receiver){
      return 
    }
    article_id = val.article_id
    consult = 0
    const notice = await Notice.find(id)
    const socket_id = notice.socket_id
    if(!notice.online){
      // 提示信息存储到数据库
    }
    else{
      setTimeout(() => {
        io.to(socket_id).emit("reply",val)
      }, 2000);
    }
    await NoticeInfo.createInfo(type,sponsor,receiver,article_id,content,consult)
  })
  // 上线通知
  await socket.on("uid",async (val)=>{
    await Notice.link(val,socket.id)
    const noticeInfo = await NoticeInfo.findAndCountAll({
      where:{
        receiver:val,
        consult:0
      }
    })
    await io.to(socket.id).emit("login",noticeInfo)
  })

}

module.exports ={
  monitor
}
