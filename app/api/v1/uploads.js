const Router = require("koa-router")
const {Auth} = require('../../../middlewares/auth')
const { success } = require("../../lib/helper")
const {Article} = require("../../models/article")
const upload = require('../../routes/upload')
const file = require("../../routes/files")

const router = new Router({
  prefix:'/v1/uploads'
})

let date = new Date()
let month = date.getMonth()+1
let day = date.getDate()
const temp = {
  year:date.getFullYear(),
  month:month<10?"0"+month:month,
  day:day<10?"0"+day:day
}
router.post('/addpic',new Auth().m,upload.single('file'), async (ctx,next)=>{
  // let name = ctx.req.file.originalname
  let url = global.config.Basepath+`/article/${temp.year}${temp.month}${temp.day}/${ctx.req.file.filename}`

  success(url,"添加图片成功")
})

router.post("/addfiles" ,new Auth().m,upload.any("file"),async ctx=>{
  console.log(ctx.req.files)
  success()
})
router.post("/addfile",new Auth().m,async ctx=>{
  let err = await file.single("file")(ctx)
    .then(res=>res)
    .catch(err=>err)
  if(!err.request){
    console.log(err)
    throw new global.errs.FileError()
  }
  else{
    let url = global.config.Basepath+`/files/${temp.year}${temp.month}${temp.day}/${ctx.req.file.filename}`
    success(url,"文件上传成功")
  } 
  
})

router.delete("/article/:imgid", new Auth().m, async (ctx)=>{

})

module.exports = router