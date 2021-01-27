const Router = require('koa-router')
const { LoginType } = require('../../lib/enum')
const {TokenValidator,NotEmptyValidator} = require('../../lib/validators/validator')
const { User } = require('../../models/user')
const { generateToken } = require('../../../core/util')
const { WXManager } = require('../../services/wx')
const {Auth} = require('../../../middlewares/auth')
const { success } = require('../../lib/helper')
const router = new Router({
  prefix:'/v1/token',
})

router.post('/', async (ctx)=>{
  const v = await new TokenValidator().validate(ctx)
  switch(v.get('body.type')){
    case LoginType.USER_EMAIL:
      try {
        token = await emailLogin(v.get('body.account'),v.get('body.secret'))
      } catch (error) {
        message = error.msg
        code = error.code
      }
      break;
    case LoginType.USER_MINI_PROGRAM:
      token = await WXManager.codeToToken(v.get('body.account'))
      break;
    case LoginType.USER_MOBILE:
      break
    case LoginType.SUPER_ADMIN:
      // User.verifySuperManager()
      token = await superManagerLogin(v.get('body.account'),v.get('body.secret'))
      break
    default:
    throw new global.errs.ParameterException('没有相应处理函数')
  }
  success()
})

router.post("/admin",async (ctx)=>{

})

router.post('/verify',async (ctx)=>{
  const v = await new NotEmptyValidator().validate(ctx)
  const res = Auth.verifyToken(v.get('body.token'))
  ctx.body = {
    is_valide :res
  }
})

async function emailLogin(account,secret){
  const verified = await User.verifyEmailPassword(account,secret)
  
  return generateToken(verified.id, Auth.USER)
}

async function superManagerLogin(account,secret){
  const verified = await User.verifyEmailPassword(account,secret)
  return generateToken(verified.id, Auth.SUPER_ADMIN)
}

module.exports = router


