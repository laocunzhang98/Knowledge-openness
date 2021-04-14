const Router = require("koa-router")
var fs= require("fs")
const { Auth, OrgAuth } = require('../../../middlewares/auth')
const path = require("path")
const { success } = require("../../lib/helper")
const upload = require('../../routes/upload')
const file = require("../../routes/files")
const chunkfile = require("../../routes/chunkfile")
const { Files } = require("../../models/files")
const { FolderValidator } = require("../../lib/validators/validator")
const router = new Router({
  prefix: '/v1/uploads'
})

let date = new Date()
let month = date.getMonth() + 1
let day = date.getDate()
const temp = {
  year: date.getFullYear(),
  month: month < 10 ? "0" + month : month,
  day: day < 10 ? "0" + day : day
}
// 上传图片
router.post('/addpic', new Auth().m, upload.single('file'), async (ctx, next) => {
  let url = global.config.Basepath + `/article/${temp.year}${temp.month}${temp.day}/${ctx.req.file.filename}`
  success(url, "添加图片成功")
})

// 上传文件
router.post("/addfile", new Auth().m, new OrgAuth().n, async ctx => {
 
  let err = await file.single("file")(ctx)
    .then(res => res)
    .catch(err => err)

  if (!err.request) {
    throw new global.errs.FileError()
  }
  else {
    console.log(ctx.req.file);
    let url = global.config.Basepath + `/files/${temp.year}${temp.month}${temp.day}/${ctx.req.file.filename}`
    let data = {
      filename: ctx.req.filefilename,
      origin_path: path.resolve(ctx.req.file.destination).split("\\").pop(),
      url: url,
      size: ctx.req.file.size
    }
    success(data, "文件上传成功")
  }

})
// 删除图片
router.delete("/article/:imgid", new Auth().m, async (ctx) => {

})
// 新建文件夹
router.post("/destination", new Auth().m, new OrgAuth().n, async ctx => {
  const v = await new FolderValidator().validate(ctx)
  const files = await Files.create({
    uid: ctx.auth.uid,
    filename: v.get("body.filename"),
    origin_name: v.get("body.origin_name") || v.get("body.filename"),
    parent_fileid: v.get("body.parent_fileid") || 0,
    parent_filename: v.get("body.parent_filename") || "",
    mimetype: v.get("body.mimetype") == "plain" ? "text" : v.get("body.mimetype") || "dir",
    origin_path: `${temp.year}${temp.month}${temp.day}`,
    organize_id: ctx.request.body.organize_id || 0,
    size: v.get("body.size") || 0
  })
  success(files)
})


router.post("/filechucks", new Auth().m, async ctx => {

  let err = await chunkfile.single("chunk")(ctx)
 
  if (!err.request) {
    throw new global.errs.FileError()
  }
  else {
    // let url = global.config.Basepath + `/files/${temp.year}${temp.month}${temp.day}/${ctx.req.file.filename}`
    let data = {
      // filename: ctx.req.file.filename,
      // origin_path: path.resolve(ctx.req.file.destination).split("\\").pop(),
      // url: url,
      // size: ctx.req.file.size
    }
    // 因无法获取form-data hash值 只能通过获取后修改文件名
    fs.rename(ctx.req.file.path,ctx.req.file.destination+"\\\\"+ctx.req.body.hash,(err)=>{
    })
    // success(data, "文件上传成功")
  }
  // const multipart = new multiparty.Form();
  // multipart.parse(ctx,async (err, fields, files) => {
  //   console.log(files)
  // })
  success()
})

module.exports = router