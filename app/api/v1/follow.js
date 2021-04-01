const Router = require('koa-router')
const { Auth } = require('../../../middlewares/auth')
const {success} = require('../../lib/helper')
const {Follow} = require("../../models/follow")
const {User} = require("../../models/user")
const {FollowValidator} = require("../../lib/validators/validator")
const {Log} = require("../../models/log")
const {Op} = require("sequelize")
const router = new Router({
  prefix:"/v1/follow"
})

// 关注
router.post("/",new Auth().m, async ctx=>{
  const v = await new FollowValidator().validate(ctx)
  await Follow.follow(ctx.auth.uid,v.get("body.fid"))
  success("操作成功","操作成功")
})
// 判断是否关注
router.get("/isfollow", new Auth().m, async (ctx)=>{
  const isFollow = await Follow.findOne({
    where:{
      uid:ctx.auth.uid,
      fid:ctx.query.fid
    }
  })
  if(isFollow){
    success("1",)
  }
  success("0",)
})
// 获取user关注列表
router.get("/user",new Auth().m,async ctx=>{
  let uid = ctx.query.uid || ctx.auth.uid
  const follows = await Follow.findAll({
    where:{
      uid:uid
    }
  })
  let ids = []
  for(let follow of follows){
    ids.push(follow.fid)
  }
  const user = await User.findAll({
    where:{
      id:{
        [Op.in]:ids
      },
    },
    attributes: [
      "nickname",
      "avatar",
      "email",
      "id",
      "job",
      "describe",
      "fans_nums",
      "follow_nums"
    ]
  })
  
  success(user)
})

module.exports = router