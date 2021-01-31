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
  console.log(1111)
  await Follow.follow(ctx.auth.uid,v.get("body.fid"))
  success()
})
module.exports = router