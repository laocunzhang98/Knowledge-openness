const Router = require("koa-router")
const {Auth} = require('../../../middlewares/auth')
const { success } = require("../../lib/helper")
const {Article} = require("../../models/article")
const {Comment} = require("../../models/comment")

const router = new Router({
  prefix:'/v1/comment',
})


router.post("/", new Auth().m, async ctx=>{
  Comment.create({
    article_id,
    article_uid,
    uid:ctx.auth.uid,
    oid,
    content
  })
})


module.exports = router

