class HttpException extends Error {
  constructor(msg = '服务器异常', errorCode = 10000, code = 400) {
    super()
    this.errorCode = errorCode
    this.code = code
    this.msg = msg
  }
}
class ParameterException extends HttpException {
  constructor(msg, errorCode) {
    super()
    this.msg = msg || '参数错误'
    this.code = 400
    this.errorCode = errorCode || 10000
  }
  
}

class Success extends HttpException{
  constructor(data,message){
    super()
    this.code = 200
    this.msg = message || "success"
    this.errorCode = 0
    this.data = data || ''
    this.errorCode = 0
  }
}
class NotFound extends HttpException{
  constructor(msg,errorCode){
    super()
    this.code = 404
    this.msg = msg || '资源未找到'
    this.errorCode = errorCode || 10000
  }
}
class AuthFailed extends HttpException{
  constructor(msg,errorCode){
    super()
    this.code = 401
    this.msg = msg || '授权失败'
    this.errorCode = errorCode || 10004
  }
}
class Forbbiden extends HttpException{
  constructor(msg,errorCode){
    super()
    this.msg = msg || '禁止访问'
    this.errorCode = errorCode || 4001
    this.code = 403
  }
}
class LikeError extends HttpException {
  constructor(msg, errorCode) {
      super()
      this.code = 400
      this.msg = "你已经点赞过"
      this.errorCode = 60001
  }
}

class DislikeError extends HttpException {
  constructor(msg, errorCode) {
      super()
      this.code = 400
      this.msg = "你已取消点赞"
      this.errorCode = 60002
  }
}
class CheckCodeError extends HttpException{
  constructor(msg,errorCode){
    super()
    this.code = 400
    this.msg = msg || "验证码错误"
    this.errorCode = errorCode || 10000
  }
}
class EmailError extends HttpException{
  constructor(msg,errorCode){
    super()
    this.code = 400
    this.msg = msg || "邮箱无法接收短信"
    this.errorCode = errorCode || 50000
  }
}
class FollowError extends HttpException{
  constructor(msg,errorCode){
    super()
    this.code = 400
    this.msg = msg || "你已经关注过此用户"
    this.errorCode = errorCode || 50000
  }
}

class FileError extends HttpException{
  constructor(msg,errorCode){
    super()
    this.code = 400
    this.msg = msg || "文件上传失败"
    this.errorCode = errorCode || 50000
  }
}
class FollowMineError extends HttpException{
  constructor(msg,errorCode){
    super()
    this.code = 400
    this.msg = msg || "关注错误",
    this.errorCode = errorCode || 10000
  }
}

module.exports = {
  HttpException,
  ParameterException,
  Success,
  NotFound,
  AuthFailed,
  Forbbiden,
  LikeError,
  DislikeError,
  CheckCodeError,
  EmailError,
  FollowError,
  FileError,
  FollowMineError
}