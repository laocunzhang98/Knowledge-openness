const Router = require("koa-router")
const {Auth} = require('../../../middlewares/auth')
const { success } = require("../../lib/helper")
const {Article} = require("../../models/article")
const {Comment} = require("../../models/comment")
const {CommentValidator} = require("../../lib/validators/validator")
const {User} = require("../../models/user")
const router = new Router({
  prefix:'/v1/comment',
})

// 评论
router.post("/", new Auth().m, async ctx=>{
  const v = await new CommentValidator().validate(ctx)
  let article_id = v.get("body.article_id")
  let article_uid = v.get("body.article_uid")
  let oid = v.get("body.oid") || 0
  let comment_id = v.get("body.comment_id") || 0
  if(v.get("body.oid")){
    oid = v.get("body.oid")
  }
  let content = v.get("body.content")
  const comment = await Comment.comment(article_id,article_uid,ctx.auth.uid,oid,content,comment_id)
  await Log.create({
    uid:ctx.auth.uid,
    target_id:ctx.request.body.article_id,
    type:"评论",
    info:content,
    team_id: organize_id
  })
  success(comment,"评论成功")
})

// 获取评论
router.get("/getcomment", new Auth().m, async ctx =>{
  const article_id = ctx.query.article_id
  const comments = await Comment.findAll({
    where:{
      article_id,
    },
    order: [
      ['createdAt', 'asc']
    ],
  })
  let data = {
    first:[],
    second:[]
  }
  // 处理二级评论
  for(let comment of comments){
    const user = await User.findOne({
      where:{
        id:comment.uid
      }
    })
    if(comment.oid !==0){
      const Replier = await User.findOne({
        where:{
          id:comment.oid
        }
      })
      comment.dataValues.replier = Replier.nickname
    }
    comment.dataValues.nickname = user.nickname
    comment.dataValues.avatar = user.avatar
    comment.dataValues.job = user.job
    if(comment.comment_id ===0){
      data.first.push(comment)
    }
    else{
      data.second.push(comment)
    }
  }
  for(let i=0; i<data.first.length;i++){
    data.first[i].dataValues.second = []
    for(let second of  data.second){
      if(data.first[i].id === second.comment_id){
        data.first[i].dataValues.second.push(second)
      }
    }
  }
  success(data.first)
})

module.exports = router

