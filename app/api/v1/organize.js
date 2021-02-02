const Router = require('koa-router')
const { Auth } = require('../../../middlewares/auth')
const {success} = require('../../lib/helper')
const {Organize} = require("../../models/Organize")


const router = new Router({
  prefix:"/v1/organize"
})

router.post("/create",new Auth().m,async ctx=>{
  await Organize.create({
    uid:ctx.auth.uid
  })
  success()
  }
)


module.exports = router

