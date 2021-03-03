const basicAuth = require('basic-auth')
const jwt = require('jsonwebtoken')
const { User } = require('../app/models/user')
const {Organize,Orgmember} = require("../app/models/Organize")
class Auth {
  constructor(level){
    this.level = level || 1
    Auth.USER = 8
    Auth.ADMIN = 16
    Auth.SUPER_ADMIN = 32
  }
  get m(){
    return async (ctx,next)=>{
      const userToken = basicAuth(ctx.req)
      let errmsg = '密码不正确，请重新输入！'
      let errorCode = 4001
      if(!userToken || !userToken.name){
        throw new global.errs.Forbbiden(errmsg,errorCode)
      }
      try {
        var decode = await jwt.verify(userToken.name,global.config.security.secretKey)
      } catch (error) {
        // 明确提示
        if(error.name === "TokenExpiredError"){
          errmsg = "登录已失效，请重新登录！"
          errorCode = 4002
        }
        
        throw new global.errs.Forbbiden(errmsg,errorCode)
      }
      if(decode.scope < this.level){
        errmsg = '权限不足'
        errorCode = 4003
        throw new global.errs.Forbbiden(errmsg,errorCode)
      }
      
      ctx.auth = {
        uid:decode.uid,
        scope:decode.scope
      }
      const user = await User.findOne({
        where:{
          id:decode.uid
        }
      })
      if(!user){
        throw new global.errs.Forbbiden("用户已经注销",4001)
      }
      await next()
    }
  }

  static verifyToken(token){
    try {
      jwt.verify(token,global.config.security.secretKey)
      return true
    } catch (error) {
      return false
    }
  }
}
class OrgAuth{
  get n(){
    return async (ctx,next)=>{
      if(ctx.query.organize_id){
        ctx.organize_id = ctx.query.organize_id
      }
      if(ctx.request.body.organize_id){
        ctx.organize_id = ctx.request.body.organize_id
      }
      const isOrg = await Orgmember.findOne({
        where:{
          member_id:ctx.auth.uid,
          team_id:ctx.organize_id||0
        }
      })
      if(!isOrg){
        throw new global.errs.NotFound()
      }
      
      if(isOrg.level<16){
        throw new global.errs.OrgLevelError()
      }
      ctx.org = {
        level:isOrg.level
      }
      await next()
    }
  }
}
module.exports = {
  Auth,
  OrgAuth
}