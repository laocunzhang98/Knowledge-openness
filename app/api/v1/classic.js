const Router = require("koa-router")
const {Auth} = require('../../../middlewares/auth')
const { success } = require("../../lib/helper")
const {Article} = require("../../models/article")
const upload = require('../../routes/upload')
const { User } = require("../../models/user")
const {ArticleValidator,ArticleInfoValidator} = require("../../lib/validators/validator")
const db = require("../../../core/db")

const router = new Router({
  prefix:'/v1/classic',
})
let date = new Date()
let month = date.getMonth()+1
let day = date.getDate()
const temp = {
  year:date.getFullYear(),
  month:month<10?"0"+month:month,
  day:day<10?"0"+day:day
}
// upload.single('file'),
router.post('/pub',new Auth().m,upload.single('file'), async (ctx,next)=>{
  // let name = ctx.req.file.originalname
  const v = await new ArticleInfoValidator().validate(ctx)
  let url
  try {
    url = global.config.Basepath+`/article/${temp.year}${temp.month}${temp.day}/${ctx.req.file.filename}`
  } catch (error) {
    url = ""
  }
  // console.log(ctx.request.body)
  await Article.create({
    title:ctx.request.body.title,
    label:ctx.request.body.label,
    content:ctx.request.body.content,
    image:ctx.request.body.image,
    classify_name:ctx.request.body.classify,
    uid:ctx.auth.uid
  })
  success("发表成功","发表成功,快去看看吧！")
})

router.get('/article/follow/:id',new Auth().m, async (ctx,next)=>{
  const v = await new ArticleValidator().validate(ctx)
  console.log(v.get("path.id"))
  const article_id = ctx.params.id 
  const article = await Article.findOne({
    where:{
      id:article_id
    },
    attributes:["uid"]
  })
  if(!article){
    throw new global.errs.NotFound()
  }
  const user = await User.findOne({
    where:{
      id:article.dataValues.uid
    },
    attributes:["avatar","nickname"]
  })
  success(user.dataValues)
})
// 获取文章信息
router.get('/article/:id', new Auth().m,async (ctx,next)=>{
  // const v = await new ArticleValidator().validate(ctx)
  const article_id = ctx.params.id
  const article = await Article.findOne({
    where:{
      id:article_id
    }
  })
  if(!article){
    throw new global.errs.NotFound()
  }
  await article.increment('read_nums',{
    by:1
  })
  success(article.dataValues)
})

router.get('/latest', new Auth().m, async (ctx,next)=>{
  const r = await Article.findAll({
  })
  const result = []
  r.forEach((article)=>{
    console.log(article.id)
  })
  for(let i =0;i<r.length;i++){
    console.log(r[i])
    const user = await User.findOne({
      where:{
        id:r[i].dataValues.uid
      }
    })
    let data = r[i].dataValues
    data.name = user.dataValues.nickname
    result.push(data)
  }
    
  success(result)
  
})

module.exports = router
