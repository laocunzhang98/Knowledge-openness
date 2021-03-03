const Router = require('koa-router')
const { Auth } = require('../../../middlewares/auth')
const {Favor} = require("../../models/favors")
const {success} = require('../../lib/helper')
const {Article} = require('../../models/article')
const {Op} = require("sequelize")
const { User } = require('../../models/user')
const router = new Router({
  prefix:'/v1/favor'
})
// 获取点赞列表
router.get("/all", new Auth().m, async ctx=>{
  const r = await Favor.findAll({
    where:{
      uid:ctx.auth.uid
    }
  })
  let favorList = []
  for(let favor of r){
    favorList.push(favor.dataValues.article_id)
  }
  success(favorList)
})
router.post('/',new Auth().m,async ctx=>{
  await Favor.like(ctx.request.body.article_id,ctx.auth.uid)
  success()
})
// 获取点赞文章
router.get("/article",new Auth().m,async ctx=>{
  let uid = ctx.query.uid || ctx.auth.uid
  const articleList = await Favor.findAll({
    where:{
      uid:uid
    }
  })
  let result = []
  for(let article of articleList){
    const art = await Article.findOne({
      where:{
        id:article.article_id
      }
    })
    if(!art){
      continue
    }
    const user = await User.findOne({
      where:{
        id:art.uid
      },
      attributes:["nickname"]
    })
    art.dataValues.name = user.nickname
    result.push(art)
  }
  success(result)
})

module.exports = router
