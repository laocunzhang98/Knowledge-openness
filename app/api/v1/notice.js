const { Notice, NoticeInfo } = require("../../models/notice")
const {SysApplyInfo} = require("../../models/apply")
const Router = require('koa-router')
const { Auth } = require('../../../middlewares/auth')
const { success } = require('../../lib/helper')
const { Organize } = require("../../models/Organize")
const { Op } = require("sequelize")
const { User } = require("../../models/user")
const { Article } = require("../../models/article")
const { ApplyInfo } = require("../../models/apply")

const router = new Router({
  prefix: "/v1/notice"
})


router.get("/info", new Auth().m, async ctx => {
  const infos = await NoticeInfo.findAll({
    where: {
      receiver: ctx.auth.uid
    },
    order: [
      ["createdAt", "DESC"]
    ]
  })
  if (!infos.length) {
    success(infos)
  }
  for (let info of infos) {
    let article = await Article.findOne({
      where: {
        id: info.dataValues.target_id
      }
    })
    let user = await User.findOne({
      where: {
        id: info.dataValues.sponsor
      },
      attributes: { exclude: ['password', "level"] }
    })
    info.dataValues.user = user.dataValues
    if (article) {
      info.dataValues.article = article.dataValues
    } else {
      info.dataValues.article = { title: "该文章已消失" }

    }
  }
  // console.log(infos[0].dataValues)
  success(infos)
})
// 读取消息 下次免推送
router.post("/readinfo", new Auth().m, async ctx => {
  let ids = ctx.request.body.ids
  NoticeInfo.update({ consult: 1 }, {
    where: {
      id: {
        [Op.in]: ids
      }
    }
  })
  success()
})
// 读取消息 下次免推送
router.post("/readapply", new Auth().m, async ctx => {
  let ids = ctx.request.body.aids
  await ApplyInfo.update({ consult: 1 }, {
    where: {
      id: {
        [Op.in]: ids
      }
    }
  })
  success()
})

//读取系统消息 下次免推送
router.post("/readsysapply", new Auth().m, async ctx => {
  let ids = ctx.request.body.ids
  let infos = await SysApplyInfo.update({ consult: 1 }, {
    where: {
      id: {
        [Op.in]: ids
      }
    }
  })
  
  success()
})
//获取系统消息
router.get("/sysinfo", new Auth().m, async ctx => {
  const sysInfo = await SysApplyInfo.findAll({
    where: {
      receiver: ctx.auth.uid
    },
    order: [
      ["createdAt", "DESC"]
    ]
  })
  for (let info of sysInfo){
    let article = await Article.findOne({
      paranoid:false,
      where:{
        id:info.target_id,
        deletedAt:{
          [Op.ne]:null
        }
      }
    })
    info.dataValues.article = article
  }
  success(sysInfo)
})
// 获取申请消息
router.get("/applyinfo", new Auth().m, async ctx => {
  const applyInfo = await ApplyInfo.findAll({
    where: {
      receiver: ctx.auth.uid
    },
    order: [
      ["createdAt", "DESC"]
    ]
  })
  if (!applyInfo) {
    success([])
  }
  for (let apply of applyInfo) {
    apply.dataValues.applicant = await User.findOne({ where: { id: apply.sponsor }, attributes: ["nickname"] })
    apply.dataValues.team_name = await Organize.findOne({ where: { team_id: apply.target_id }, attributes: ["team_name"] })
  }
  success(applyInfo)
})
// 拒绝申请
router.post("/refuseapply", new Auth().m, async ctx => {
  let sponsor = ctx.request.body.sponsor
  let target_id = ctx.request.body.target_id
  await ApplyInfo.handleApply("拒绝",sponsor,target_id)
  success("操作成功","操作成功")
})


module.exports = router