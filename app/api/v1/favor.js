const Router = require('koa-router')
const { Auth } = require('../../../middlewares/auth')
const {PositiveIntegerValidator} = require("../../lib/validators/validator")
const {Favor} = require("../../models/favors")
const {success} = require('../../lib/helper')
const article = require('../../models/article')
const router = new Router({
  prefix:'/v1/favor'
})


router.post('/',new Auth().m,async ctx=>{
  const v = await new PositiveIntegerValidator().validate(ctx,{
    id:"article_id"
  })
  await Favor.like(v.get('body.article_id'),ctx.auth.uid)
  success()
})

module.exports = router
