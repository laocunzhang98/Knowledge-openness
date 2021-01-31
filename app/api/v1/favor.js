const Router = require('koa-router')
const { Auth } = require('../../../middlewares/auth')
const {Favor} = require("../../models/favors")
const {success} = require('../../lib/helper')
const {Article} = require('../../models/article')
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
  // const v = await new PositiveIntegerValidator().validate(ctx,{
  //   id:"article_id"
  // })
  // console.log(ctx.request.body)
  await Favor.like(ctx.request.body.article_id,ctx.auth.uid)
  success()
})

module.exports = router
