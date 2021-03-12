const Router = require("koa-router")
const { success } = require("../../lib/helper")
const { db } = require("../../../core/db")
const {Violation} = require("../../models/violation")
const { Auth } = require("../../../middlewares/auth")

const router = new Router({
  prefix:"/v1/violation"
})

router.post("/add",new Auth(16).m, async ctx=>{
  await Violation.create({
    
  })
})


module.exports = router

