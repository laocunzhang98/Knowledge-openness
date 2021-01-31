const Router = require('koa-router')
const { Auth } = require('../../../middlewares/auth')
const {success} = require('../../lib/helper')
const {Classify} = require("../../models/classify")
const router = new Router({
  prefix:'/v1/classify'
})

router.get("/", new Auth().m, async(ctx)=>{
  const classify = await Classify.findAll({
    group:"classify_name",
    attributes:["classify_name"]
  })
  let result = []
  for(let category of classify){
    result.push(category.dataValues.classify_name)
  }
  success(result)
})
module.exports =  router


