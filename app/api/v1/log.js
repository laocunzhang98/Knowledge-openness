const Router = require('koa-router')
const { Auth } = require('../../../middlewares/auth')
const {success} = require('../../lib/helper')
const {Log} = require("../../models/log")

const router = new Router({
  prefix:"/v1/log"
})


router.get("/list",new Auth(8).m, async ctx=>{
  const logs = await Log.findAndCountAll({

  })
  success(logs)
})


module.exports = router
