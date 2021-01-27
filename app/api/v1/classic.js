const Router = require("koa-router")
const {Auth} = require('../../../middlewares/auth')
const { success } = require("../../lib/helper")
const {Article} = require("../../models/article")
const upload = require('../../routes/upload')
const path = require("path")
const { User } = require("../../models/user")

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
  let url = global.config.Basepath+`/article/${temp.year}${temp.month}${temp.day}/${ctx.req.file.filename}`
  console.log(ctx.req.file)
  // await Article.create({
  //   title:"xx这是文章标题xx",
  //   label:"这是文章标签",
  //   content:"这是文章内容",
  //   image:url,
  //   fav_nums:0,
  //   com_nums:0,
  //   uid:ctx.auth.uid
  // })
  success(url)
})



router.get('/latest', new Auth().m, async (ctx,next)=>{
  const r = await Article.findAll({
  })
  const result = []
  for(let i =0;i<r.length;i++){
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
