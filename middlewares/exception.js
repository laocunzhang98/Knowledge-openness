const {HttpException} = require('../core/http-exception')

const catchError = async (ctx,next)=>{
  try {
    await next()
  } catch (error) {
    // console.log(error)
    const isHttpException = error instanceof HttpException
    const isDev = global.config.environment==="dev"
    // console.log(isDev)
    if(!isHttpException && isDev){
      throw error
    }
    if(error instanceof HttpException){
      ctx.body = {
        code:error.code,
        message:error.msg || "参数错误",
        error_code:error.errorCode,
        request:`${ctx.method} ${ctx.path}`,
        data:error.data,
        respTime:new Date().getTime()
      }
      // ctx.status = error.code
    }
    else{
      ctx.body = {
        message:'we made a mistake (*^▽^*)',
        err_code:999,
        request:`${ctx.method} ${ctx.path}`
      }
      ctx.status = 500
    }
  }
}
module.exports = catchError