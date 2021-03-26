const Router = require('koa-router')
const { Auth,OrgAuth } = require('../../../middlewares/auth')
const {Files} = require("../../models/files")
const send = require("koa-send")
const { success } = require('../../lib/helper')
const { Op } = require("sequelize")
const { db } = require("../../../core/db")
const { Log } = require("../../models/log")
const router = new Router({
  prefix:"/v1/download"
})
// 获取当前时间


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
    if(file.mimetype==="png"||file.mimetype==="jpeg"||file.mimetype === "gif"){
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
router.delete("/delfile",new Auth().m,new OrgAuth().n, async ctx=>{
  let files = await Files.findAll({
    where:{
      id:{
        [Op.in]:ctx.request.body.ids
      },
    }
  })
  await Files.destroy({
    where:{
      id:{
        [Op.in]:ctx.request.body.ids,
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
        },
      }
    })
    await Files.destroy({
      where:{
        parent_fileid:{
          [Op.in]:ids
        },
      }
    })
  }
  for(let id of ctx.request.body.ids){
    await Log.create({
      uid:ctx.auth.uid,
      target_id:id,
      type:"删除",
      info:"删除文件",
      team_id: ctx.organize_id || 0
    })
  }
  success(files,"删除成功！")
})
// 获取可移动文件的目录
router.get("/allcate",new Auth().m,new OrgAuth().n, async ctx=>{
  let ids = JSON.parse(ctx.query.ids)|| []
  let params = {
    mimetype:"dir",
    parent_fileid:0,
    id:{
      [Op.notIn]:ids
    },
    organize_id:0
  }
  let organize_id = ctx.query.organize_id
  if(organize_id){
    params.organize_id = organize_id
  }else{
    params.uid = ctx.auth.uid
  }
  const files = await Files.findAll({
    where:params
  })
  for(let file of files){
    params.parent_fileid = file.id
    let childFile =  await Files.findAll({
      where:params
    })
    file.dataValues.children = childFile
    await convertChild(childFile)
  }
  async function convertChild(fileArr){
    for(file of fileArr){
      params.parent_fileid = file.id
      let childFile = await Files.findAll({
        where:params
      })
      file.dataValues.children = childFile
      if(childFile){
        await convertChild(childFile)
      }
    }
  }
  success(files)
})
// 移动文件
router.post("/movefile", new Auth().m, async ctx=>{
  let ids = ctx.request.body.moveId
  let currentId = ctx.request.body.currentId
  await Files.update({parent_fileid : currentId},{
    where:{
      id:{
        [Op.in]:ids
      }
    }
  })
  success("移动成功","移动成功")
})
// 获取文件类型
router.get("/mimetype", new Auth().m, async ctx=>{
  let mimetypes = await Files.findAll({
    where:{
      organize_id:ctx.query.organize_id,
      mimetype:{
        [Op.ne]:"dir"
      }
    },
    attributes: [[db.fn('COUNT', db.col('*')), 'value'],['mimetype',"name"]],
    group:"mimetype"
  })
  success(mimetypes)
})
// 获取文件总数
router.get("/filetotal",new Auth().m, async ctx=>{
  let filecount = await Files.count({
    where:{
      organize_id:ctx.query.organize_id,
      mimetype:{
        [Op.ne]:"dir"
      }
    }
  })
  success(filecount)
})
//获取当天文件数量
router.get("/dayfile",new Auth(16).m,async ctx=>{
  // const dayfile = await Files.findAndCountAll({
  //   where:{
  //     mimetype:{
  //       [Op.ne]:"dir"
  //     },
  //     createdAt:"2020-03-05"
  //   }
  // })
  let data = []
  for(let i = 0; i < 2 ; i++){
    let sql = `SELECT * FROM logs WHERE DATEDIFF(NOW(),createdAt)= ${i}`
    let day = await db.query(sql)
    data.unshift(day[0])
  }
  // let time = '2021-03-05'
  // let sql = `SELECT * FROM logs WHERE DATEDIFF('${time}',createdAt)= 0`
  // const dayfile = await db.query(sql)
  success(data)
})

module.exports = router
