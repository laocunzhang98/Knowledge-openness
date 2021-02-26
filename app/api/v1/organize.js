const Router = require('koa-router')
const { Auth } = require('../../../middlewares/auth')
const {success} = require('../../lib/helper')
const {OrgInfoValidator} = require("../../lib/validators/validator")
const {Organize , Orgmember} = require("../../models/Organize")
const {Op} = require("sequelize")
const {db} = require("../../../core/db")
const router = new Router({
  prefix:"/v1/organize"
})
// 创建组织
router.post("/create",new Auth().m,async ctx=>{
  const organize = await Organize.create({
    team_name:ctx.request.body.team_name,
    uid:ctx.auth.uid,
  })
  await Orgmember.create({
    team_id:organize.team_id,
    member_id:ctx.auth.uid,
    level:32,
    total:1
  })
  success("团队创建成功","团队创建成功")
  }
)
// 获取组织信息
router.get("/orginfo",new Auth().m,async ctx=>{

})
router.post("/updateinfo", new Auth().m, async ctx =>{
  const v = await new OrgInfoValidator().validate(ctx)
  let team_name = v.get("body.team_name")
  let describe = v.get("body.describe")
  let avatar = v.get("body.avatar")
  let team_id = v.get("body.team_id")
  await Organize.update({
    team_name,
    describe,
    avatar
  },{
    where:{
      team_id:team_id,
      uid:ctx.auth.uid
    }
  })
  success("更新成功")
})
// 离开组织
router.post("/leave",new Auth().m, async ctx=>{
  let team_id = ctx.request.body.team_id
  const member = await Orgmember.findOne({
    where:{
      team_id:team_id
    }
  })
  if(!member){
    throw new global.errs.OrgLeaveError()
  }
  db.transaction(async t =>{
    await Orgmember.destroy({
      where:{
        team_id:team_id,
        member_id:ctx.auth.uid,
      }
    },{transaction:t})
  })
  const org = await Organize.findOne({
    where:{
      team_id:team_id
    }
  })
  await org.decrement("total",{by:1,transaction:t})
})
// 加入组织 未完成
router.post("/join",new Auth().m,async ctx=>{
  let team_id = ctx.request.body.team_id
  const member = await Orgmember.findOne({
    where:{
      team_id:team_id
    }
  })
  if(member){
    // 提示错误
    throw new global.errs.OrgJoinError()
  }
  db.transaction(async t=>{
    await Orgmember.create({
      team_id:team_id,
      member_id:ctx.auth.uid,
      level:0
    },{transaction:t})
    const org = await Organize.findOne({
      where:{
        team_id:team_id
      }
    })
    await org.increment("total",{by:1,transaction:t})
  })
  
  success(`加入${org.team_name}成功！`)
})
// 获取自己在组织中的权限
router.get("/level",new Auth().m, async ctx=>{
  const level = await Organize.findOne({
    where:{
      member_id:ctx.auth.uid,
      team_id:ctx.query.team_id
    }
  })
  success(level)
})
// 获取有发表文件文章资格的组织
router.get("/limitorg",new Auth().m, async ctx=>{
  const orglist = await Orgmember.findAll({
    where:{
      member_id:ctx.auth.uid,
      level:{
        [Op.gte]:16
      }
    }
  })
  let team_ids = []
  for(let org of orglist){
    team_ids.push(org.team_id)
  }
  const limitorg = await Organize.findAll({
    where:{
      team_id:{
        [Op.in]:team_ids
      }
    }
  })
  success(limitorg)
})
// 获取自己创建的组织
router.get("/ownorg", new Auth().m,async ctx=>{
  const orglist = await Organize.findAll({
    where:{
      uid:ctx.auth.uid,
    }
  })
  success(orglist)
})
// 获取加入的组织
router.get("/otherorg", new Auth().m, async ctx =>{
  const orglist = await Orgmember.findAll({
    where:{
      member_id:ctx.auth.uid,
    }
  })
  let team_ids = []
  for(let org of orglist){
    team_ids.push(org.team_id)
  }
  const result = await Organize.findAll({
    where:{
      team_id:{
        [Op.in]:team_ids
      }
    }
  })
  success(result)
})
// 获取team_id
router.get("/teamid",new Auth().m, async ctx=>{
  const team  = await Organize.findOne({
    where:{
      id:ctx.query.id
    }
  })
  success(team)
})

// router.get("/")


module.exports = router

