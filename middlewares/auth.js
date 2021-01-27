const basicAuth = require('basic-auth')
const jwt = require('jsonwebtoken')
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
      
      let errmsg = 'token不合法'
      let errorCode = 4001
      if(!userToken || !userToken.name){
        throw new global.errs.Forbbiden(errmsg,errorCode)
      }
      try {
        var decode = await jwt.verify(userToken.name,global.config.security.secretKey)
      } catch (error) {
        // 明确提示
        if(error.name === "TokenExpiredError"){
          errmsg = "token已过期"
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

module.exports = {
  Auth
}