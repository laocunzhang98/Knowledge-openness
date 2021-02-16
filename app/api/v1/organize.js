const Router = require('koa-router')
const { Auth } = require('../../../middlewares/auth')
const {success} = require('../../lib/helper')
const {Organize} = require("../../models/Organize")


const router = new Router({
  prefix:"/v1/organize"
})

router.post("/create",new Auth().m,async ctx=>{
  await Organize.create({
    team_name:ctx.request.body.team_name,
    uid:ctx.auth.uid,
    level:32
  })
  success("团队创建成功","团队创建成功")
  }
)


module.exports = router

