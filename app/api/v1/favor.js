const Router = require('koa-router')
const { Auth } = require('../../../middlewares/auth')
const {Favor} = require("../../models/favors")
const {success} = require('../../lib/helper')
const {Article} = require('../../models/article')
const {Op} = require("sequelize")
const router = new Router({
  prefix:'/v1/favor'
})

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

router.get("/article",new Auth().m,async ctx=>{
  const articleList = await Favor.findAll({
    where:{
      uid:ctx.auth.uid
    }
  })
  let ids = []
  for(let article of articleList){
    ids.push(article.article_id)
  }
  console.log(ids)
  const article = await Article.findAll({
    where:{
      id:{
        [Op.in]:ids
      }
    }
  })
  success(article)
})

module.exports = router
