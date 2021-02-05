const Router = require('koa-router')
const { Auth } = require('../../../middlewares/auth')
const {success} = require('../../lib/helper')
const {Follow} = require("../../models/follow")
const {FollowValidator} = require("../../lib/validators/validator")
const router = new Router({
  prefix:"/v1/follow"
})


router.post("/",new Auth().m, async ctx=>{
  const v = await new FollowValidator().validate(ctx)
  await Follow.follow(ctx.auth.uid,v.get("body.fid"))
  success("操作成功","操作成功")
})
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
module.exports = router