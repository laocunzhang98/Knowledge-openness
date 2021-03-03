const Router = require('koa-router')
const { Auth,OrgAuth } = require('../../../middlewares/auth')
const {Files} = require("../../models/files")
const send = require("koa-send")
const { success } = require('../../lib/helper')
const {Op} = require("sequelize")
const router = new Router({
  prefix:"/v1/download"
})
// 获取圈子文件


// 获取文件列表
router.get("/filelist", new Auth().m, async ctx =>{
  let condition = {
    parent_fileid:ctx.query.id || 0,
  }
  if(parseInt(ctx.query.organize_id)){
    condition.organize_id = ctx.query.organize_id
  }
  else{
    condition.uid = ctx.auth.uid
    condition.organize_id = 0
  }
  const fileList = await Files.findAll({
    where:condition
  })
  let newfileList = []
  for(let file of fileList){
    // 图片展示为自己本身
    if(file.mimetype==="png"||file.mimetype==="jpeg"){
      file.dataValues.path = `${global.config.Basepath}/files/${file.origin_path}/${file.filename}`
    }
    newfileList.push(file)
  }
  success(newfileList)
})
// 获取文件id
router.get("/folderid", new Auth().m,async ctx =>{
  const files = await Files.findOne({
    where:{
      parent_fileid:ctx.query.parent_fileid,
      origin_name:ctx.query.filename,
      uid:ctx.auth.uid
    }
  })
  success(files)
})
// 获取文件目录
router.get("/catalog", new Auth().m, async ctx =>{
  let catalog = []
  let parentCata = await Files.findOne({
    where:{
      id:ctx.query.parent_fileid,
      uid:ctx.auth.uid
    }
  })
  if(!parentCata){
    success(catalog)
  }
  catalog.unshift(parentCata.dataValues)
  while(parentCata){
    parentCata = await Files.findOne({
      where:{
        id:parentCata.parent_fileid
      }
    })
    if(!parentCata){
      break
    }
    catalog.unshift(parentCata.dataValues)
  }
  success(catalog)
})
// 获取分类文件
router.get("/catefile",new Auth().m,async ctx=>{
  let type = JSON.parse(ctx.query.type)
  let organize_id= ctx.query.organize_id || 0
  let cate = {
    uid:ctx.auth.uid,
    organize_id:organize_id
  }
  if(type.length!==0){
    cate.mimetype =  {[Op.or]: type}
  }
  else{
    cate.parent_fileid =  0
  }
  const fileList = await Files.findAll({
    where:cate
  })
  let newfileList =[]
  for(let file of fileList){
    if(file.mimetype==="png"||file.mimetype==="jpeg"){
      file.dataValues.path = `${global.config.Basepath}/files/${file.origin_path}/${file.filename}`
    }
    newfileList.push(file)
  }
  success(newfileList)
} )
// 删除文件
router.delete("/delfile",new Auth().m, async ctx=>{
  let files = await Files.findAll({
    where:{
      id:{
        [Op.in]:ctx.request.body.ids
      }
    }
  })
  await Files.destroy({
    where:{
      id:{
        [Op.in]:ctx.request.body.ids
      }
    }
  })
  while(files.length){
    let ids = []
    for(let file of files){
      ids.push(file.id)
    }
    files = await Files.findAll({
      where:{
        parent_fileid:{
          [Op.in]:ids
        }
      }
    })
    await Files.destroy({
      where:{
        parent_fileid:{
          [Op.in]:ids
        }
      }
    })
  }
  success(files,"删除成功！")
})

module.exports = router
