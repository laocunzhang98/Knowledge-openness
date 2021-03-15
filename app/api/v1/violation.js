const Router = require("koa-router")
const { success } = require("../../lib/helper")
const { db } = require("../../../core/db")
const {Violation} = require("../../models/violation")
const {SysApplyInfo} = require("../../models/apply")
const { Auth } = require("../../../middlewares/auth")

const router = new Router({
  prefix:"/v1/violation"
})

router.post("/add",new Auth(16).m, async ctx=>{
  await Violation.create({
    viouid:ctx.request.body.uid,
    viotype:ctx.request.body.type,
    vioid:ctx.request.body.id,
    vioinfo:ctx.request.body.info,
  })
  success()
})
router.post("/apply",new Auth(16).m, async ctx=>{
  let type = ctx.request.body.type
  let target_id = ctx.request.body.id
  let receiver = ctx.request.body.uid
  let notice_info = ctx.request.body.info
  await SysApplyInfo.createSysApply(type,receiver,target_id,notice_info)
  success()
})

module.exports = router

