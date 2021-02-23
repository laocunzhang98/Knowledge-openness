const Router = require('koa-router')
const { Auth } = require('../../../middlewares/auth')
const {Files} = require("../../models/files")

const send = require("koa-send")
const { success } = require('../../lib/helper')
const {Op} = require("sequelize")
const router = new Router({
  prefix:"/v1/download"
})


router.get("/file/:origin_path/:filename",new Auth().m,async ctx=>{
  // let path = `public/uploads/files/${ctx.params.origin_path}/${ctx.params.filename}`
  let path = `${global.config.Basepath}/files/${ctx.params.origin_path}/${ctx.params.filename}`
  console.log(path)
  success(path)
})

router.get("/filelist", new Auth().m, async ctx =>{
  const fileList = await Files.findAll({
    where:{
      parent_fileid:ctx.query.id || 0,
      uid:ctx.auth.uid
    }
  })
  let newfileList = []
  for(let file of fileList){
    if(file.mimetype==="png"||file.mimetype==="jpeg"){
      file.dataValues.path = `${global.config.Basepath}/files/${file.origin_path}/${file.filename}`
    }
    newfileList.push(file)
  }
  success(newfileList)
})
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
  console.log(catalog)
  success(catalog)
})

router.get("/catefile",new Auth().m,async ctx=>{
  let type = JSON.parse(ctx.query.type)
  let cate = {
    uid:ctx.auth.uid,
  }
  if(type.length!==0){
    cate.mimetype =  {[Op.or]: type}
  }
  else{
    cate.parent_fileid =  0
  }
  console.log(cate)
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
  console.log(files)
  while(files.length){
    let ids = []
    for(let file of files){
      ids.push(file.id)
    }
    console.log(ids)
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
