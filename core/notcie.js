const {Notice,NoticeInfo} = require("../app/models/notice")
const {ApplyInfo} = require("../app/models/apply")
const {Organize, Orgmember} = require("../app/models/Organize")
const {success} = require("../app/lib/helper")
monitor = async function(socket,io){
  console.log("连接成功！")
  await socket.on("disconnect",async ()=>{
    console.log("断开连接")
    // console.log(socket.id)
    await Notice.Offline(socket.id)
  })
  // 评论通信
  await socket.on("comment",async (val)=>{
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
    if(notice.online){
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
    const applyInfo = await ApplyInfo.findAndCountAll({
      where:{
        receiver:val,
        consult:0
      }
    })
    let info = {
      noticeInfo:noticeInfo,
      applyInfo:applyInfo
    }
    await io.to(socket.id).emit("login",info)
  })
  await socket.on("apply", async (val)=>{
    let org = await Organize.findOne({
      where:{
        team_id:val.team_id
      }
    })
    if(!org){
      throw new Error("该圈子不存在")
    }
    const notice = await Notice.find(val.uid)
    const socket_id = notice.socket_id
    const unotice = await Notice.find(val.sponsor)
    const usocket_id = unotice.socket_id
    let orgmember  = await Orgmember.findOne({
      where:{
        member_id:val.sponsor,
        team_id:val.team_id
      }
    })
    if(orgmember){
      io.to(usocket_id).emit("error","你已经加入该圈子")
      return 
    }
    const ainfo = await ApplyInfo.findOne({
      where:{
        sponsor:val.sponsor,
        target_id:val.team_id
      }
    })
    if(ainfo){
      io.to(usocket_id).emit("error","请勿重复提交")
      return 
    }
    if(notice.online){
      setTimeout(() => {
        io.to(socket_id).emit("apply",val)
      }, 1000);
    }
    await ApplyInfo.create({
      type:val.noticeType,
      sponsor:val.sponsor,
      receiver:val.uid,
      target_id:val.team_id,
      consult:0,
    })
    io.to(usocket_id).emit("error","申请消息已发送")
  })
}

module.exports ={
  monitor
}
