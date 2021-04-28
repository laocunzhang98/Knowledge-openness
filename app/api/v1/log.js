const Router = require('koa-router')
const { includes } = require('lodash')
const { Auth } = require('../../../middlewares/auth')
const {success} = require('../../lib/helper')
const { Article } = require('../../models/article')
const {Log} = require("../../models/log")
const { User } = require('../../models/user')

const router = new Router({
  prefix:"/v1/log"
})


router.get("/list",new Auth(8).m, async ctx=>{
  let team_id = ctx.query.organize_id
  let data =[]
  const logs = await Log.findAll({
    where:{
      team_id:team_id
    },
    limit:10
  })
  for(let log of logs){
    let map = {}
    console.log(log.dataValues);
    map.log = log.dataValues
    if(log.dataValues.category==1){
      let art = await Article.findOne({
        where:{
          id:log.dataValues.target_id
        },
        attributes:["title"]
      })
      map.art = art
    }
    // if(log.dataValues.category==2){
    //   let file = await File.findOne({
    //     where:{
    //       id:log.dataValues.target_id
    //     }
    //   })
    // }
    let user = await User.findOne({
      where:{
        id:log.dataValues.uid
      },
      attributes:["nickname"]
    })
    map.user = user
    data.push(map)
  }
  success(data)
})


module.exports = router
