const Router = require('koa-router')
const { Auth, OrgAuth } = require('../../../middlewares/auth')
const {User} = require("../../models/user")
const {success} = require('../../lib/helper')
const {OrgInfoValidator} = require("../../lib/validators/validator")
const {Organize , Orgmember} = require("../../models/Organize")
const {Op} = require("sequelize")
const {db} = require("../../../core/db")
const {ApplyInfo} = require("../../models/apply")
const { Log } = require("../../models/log")
const router = new Router({
  prefix:"/v1/organize"
})
// 创建组织
router.post("/create",new Auth().m,async ctx=>{
  const organize = await Organize.create({
    team_name:ctx.request.body.team_name,
    uid:ctx.auth.uid,
    total:1,
    open:ctx.request.body.isopen,
    type:ctx.request.body.type,
    avatar:`${global.config.Basepath}/user/tuandui.png`
  })
  await Orgmember.create({
    team_id:organize.team_id,
    member_id:ctx.auth.uid,
    level:32,
  })
  success("团队创建成功","团队创建成功")
  }
)
// 获取组织信息
router.get("/orginfo",new Auth().m, async ctx=>{
  const member = await Orgmember.findOne({
    where:{
      team_id:ctx.query.team_id,
      member_id:ctx.auth.uid
    }
  })
  if(!member){
    throw new global.errs.NotFound()
  }
  const orginfo = await Organize.findOne({
    where:{
      team_id:ctx.query.team_id
    }
  })
  success(orginfo)
})
// 更新信息
router.post("/updateinfo", new Auth().m, async ctx =>{
  const v = await new OrgInfoValidator().validate(ctx)
  let team_name = v.get("body.team_name")
  let describe = v.get("body.describe")
  let avatar = v.get("body.avatar")
  let team_id = v.get("body.team_id")
  const org = await Organize.update({
    team_name,
    describe,
    avatar
  },{
    where:{
      team_id:team_id,
      uid:ctx.auth.uid
    }
  })
  if(!org[0]){
    success("更新失败","更新失败")
  }
  success("更新成功","更新成功")
})
// 离开组织
router.post("/leave",new Auth().m, async ctx=>{
  let team_id = ctx.request.body.team_id
  const member = await Orgmember.findOne({
    where:{
      team_id:team_id,
      member_id:ctx.auth.uid
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
    const org = await Organize.findOne({
      where:{
        team_id:team_id
      }
    })
    await org.decrement("total",{by:1,transaction:t})
    await ApplyInfo.destroy({
      where:{
        sponsor:ctx.auth.uid,
        target_id:team_id
      }
    })
  })
  success("退出成功","退出成功")
})
// 加入组织 
router.post("/join",new Auth().m,async ctx=>{
  let team_id = ctx.request.body.target_id
  let uid = ctx.request.body.sponsor
  const member = await Orgmember.findOne({
    where:{
      team_id:team_id,
      member_id:uid
    }
  })
  if(member){
    // 提示错误
    throw new global.errs.OrgJoinError()
  }
  db.transaction(async t=>{
    await Orgmember.create({
      team_id:team_id,
      member_id:uid,
      level:0
    },{transaction:t})
    const org = await Organize.findOne({
      where:{
        team_id:team_id
      }
    })
    await org.increment("total",{by:1,transaction:t})
    await ApplyInfo.handleApply("同意",uid,team_id)
  })
  await Log.create({
    uid:uid,
    target_id:team_id,
    type:"加入",
    info:"加入组织",
    team_id: team_id
  })
  success(`加入圈子成功！`,'同意加入圈子')
})
// 获取自己在组织中的权限
router.get("/level",new Auth().m, async ctx=>{
  const level = await Orgmember.findOne({
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
// 获取圈子列表
router.get("/orglist",new Auth().m, async ctx =>{
  const orglist = await Organize.findAll({
    where:{
      open:1
    },
    order:[["createdAt","DESC"]]
  })
  success(orglist)
})
// 获取成员列表
router.get("/members", new Auth().m, async ctx=>{
  let organize_id = ctx.query.organize_id
  const members = await Orgmember.findAndCountAll({
    where:{
      team_id:organize_id
    }
  })
  for(let member of members.rows){
    const user = await User.findOne({
      where:{
        id:member.member_id
      }
    })
    member.dataValues.email = user.email
    member.dataValues.nickname = user.nickname
  }
  success(members)
})
// 修改成员等级
router.post("/modifylevel", new Auth().m,new OrgAuth().n, async ctx=>{
  let level = ctx.request.body.level
  let uid = ctx.request.body.uid
  let team_id = ctx.request.body.organize_id
  let ulevel = ctx.request.body.ulevel
  if(uid===ctx.auth.uid || ulevel>=ctx.org.level){
    throw new global.errs.OrgLevelError("无权限更改")
  }
  await Orgmember.update({level:level},{
    where:{
      member_id:uid,
      team_id:team_id
    }
  })
  let levelist = {
    "1":"只读成员",
    "8":"成员",
    "16":"管理员"
  }
  await Log.create({
    uid:ctx.auth.uid,
    target_id:uid,
    type:"设置",
    info:`设置为${levelist[level]}`,
    team_id: team_id
  })
  success("设置成功！","设置成功")
})
// 成员移除
router.delete("/remove", new Auth().m, new OrgAuth().n,async ctx =>{
  let team_id = ctx.organize_id
  let member_id = ctx.request.body.member_id
  let ulevel = ctx.request.body.ulevel
  if(ulevel>=ctx.org.level){
    throw new global.errs.OrgLevelError("无权限移除")
  }
  db.transaction(async t=>{
    await Orgmember.destroy({
      where:{
        team_id,
        member_id
      }
    },{transaction:t})
    const org = await Organize.findOne({
      where:{
        team_id:team_id
      }
    })
  await org.decrement("total",{by:1,transaction:t})
  })
  await ApplyInfo.destroy({
    where:{
      sponsor:member_id,
      target_id:team_id
    }
  })
  await Log.create({
    uid:ctx.auth.uid,
    target_id:member_id,
    type:"移除",
    info:`移除团队`,
    team_id: team_id
  })
  success("移除成功","移除成功")
})
// 解散组织
router.post("/dissolution", new Auth().m,async ctx =>{
  let team_id = ctx.request.body.organize_id
  const org = await Organize.destroy({
    where:{
      uid:ctx.auth.uid,
      team_id:team_id
    }
  })
  if(org){
    await Orgmember.destroy({
      where:{
        team_id:team_id
      }
    })
  }
  // 删除相关文章
  // 删除相关文件
  // 删除组织成员
  success("解散成功!","解散成功!")
})

router.post("/open",new Auth().m,new OrgAuth().n, async ctx=>{
  let open = ctx.request.body.open
  await Organize.update({
    open:open
  },{
    where:{
      team_id:ctx.organize_id
    }
  })
  success("更新成功!","更新成功!")
})
// 获取管理员人数
router.get("/manager",new Auth().m, async ctx=>{
  let manager = await Orgmember.findAndCountAll({
    where:{
      team_id:ctx.query.organize_id,
      level:16
    }
  })
  success(manager)
})

// 30日团队成立数
router.get("/statistics",new Auth(16).m,async ctx=>{

})
// 获取组织类型分类数
router.get("/classify",new Auth(16).m,async ctx=>{
  let static = await Organize.findAll({
    group:"type",
    attributes: [[db.fn('COUNT', db.col('*')), 'value'],['type',"name"]],
  })
  success(static)
})

module.exports = router

