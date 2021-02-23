const Router = require('koa-router')
const { Auth } = require('../../../middlewares/auth')
const {success} = require('../../lib/helper')
const {Organize} = require("../../models/Organize")
const {Op} = require("sequelize")

const router = new Router({
  prefix:"/v1/organize"
})

router.post("/create",new Auth().m,async ctx=>{
  await Organize.create({
    team_name:ctx.request.body.team_name,
    uid:ctx.auth.uid,
    member_id:ctx.auth.uid,
    level:32
  })
  success("团队创建成功","团队创建成功")
  }
)
router.get("/orginfo",new Auth().m,async ctx=>{
  // const orginfo = await Organize.findO
})

router.post("/join",new Auth().m,async ctx=>{
  let team_id = ctx.request.body.team_id
  const org = await Organize.findOne({
    where:{
      team_id:team_id
    }
  })
  await Organize.create({
    team_id:team_id,
    member_id:ctx.auth.uid,
    uid:org.uid,
    team_name:org.team_name,
    level:8
  })
  success(`加入${org.team_name}成功！`)
})
router.get("/level",new Auth().m, async ctx=>{
  const level = await Organize.findOne({
    where:{
      member_id:ctx.auth.uid,
      team_id:ctx.query.team_id
    }
  })
  success(level)
})
router.get("/limitorg",new Auth().m, async ctx=>{
  const limitorg = await Organize.findAll({
    where:{
      member_id:ctx.auth.uid,
      level:{
        [Op.gte]:16
      }
    }
  })
  success(limitorg)
})

router.get("/ownorg", new Auth().m,async ctx=>{
  const orglist = await Organize.findAll({
    where:{
      uid:ctx.auth.uid,
      level:32
    }
  })
  success(orglist)
})
router.get("/otherorg", new Auth().m, async ctx =>{
  const orglist = await Organize.findAll({
    where:{
      member_id:ctx.auth.uid,
      level:{
        [Op.ne] :32
      }
    }
  })
  success(orglist)
})

router.get("/teamid",new Auth().m, async ctx=>{
  const team  = await Organize.findOne({
    where:{
      id:ctx.query.id
    }
  })
  success(team)
})
module.exports = router

