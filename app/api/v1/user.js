const Router = require("koa-router")
const nodeMailer = require('nodemailer')
const Redis = require('koa-redis')
const { User } = require('../../models/user')
const { RegisterValidator,EmailValidator } = require('../../lib/validators/validator')
const { success } = require('../../lib/helper')
const { Auth } = require("../../../middlewares/auth")
const router = new Router({
  prefix: '/v1/user'
})

const Store = new Redis().client

router.post('/sendmail', async (ctx)=>{
  const v = await new EmailValidator().validate(ctx)
  // await Store.hget(`${v.get("body.email")}`)
  const conf = {
    get user() {
      return '782984630@qq.com'
    },
    get pass() { // smtp授权码，
      return 'ehqfwfaynarvbcae'
    },
    get code() { // 验证码
      return () => {
        return Math.random().toString(16).slice(2, 6).toUpperCase()
      }
    },
    get expire(){
      return new Date().getTime()
    }
    
  }
  const transportOptions = {
    host: 'smtp.qq.com',
    auth: {
      user: conf.user, // 发件邮箱
      pass: conf.pass // smtp授权码
    }
  }
  
  let code 
  // 邮件模版
  const sendMailOptions = {
    from: `"认证邮件"<${conf.user}>`, // 发件人
    to: v.get('body.email'), // 收件人
    subject: '知识大食堂注册验证', // 邮件主题
    html: `<h3>您的注册验证码是"${code = conf.code()}"</h3>
    ` // 邮件内容
  }
  
  let transporter = nodeMailer.createTransport(transportOptions)
  // send mail
  let info
  
  try {
    info = await transporter.sendMail(sendMailOptions)
    Store.hmset(`${sendMailOptions.to}`,'code',code)
    Store.hmset(`${sendMailOptions.to}`,'expire',conf.expire)
    Store.hmset(`${sendMailOptions.to}`,'email',sendMailOptions.to)
  } catch (error) {
    throw new global.errs.EmailError()
  }
  if (info) {
    success('邮件发送成功')
  }
})

router.post('/register', async (ctx) => {
  // 接收参数
  const v = await new RegisterValidator().validate(ctx)
  const savecode = await Store.hget(`${v.get("body.email")}`,'code')
  const expire = await Store.hget(`${v.get("body.email")}`,'expire')
  const email = await Store.hget(`${v.get("body.email")}`,'email')
  const user = {
    email: v.get('body.email'),
    password: v.get('body.password2'),
    nickname: v.get('body.nickname'),
    avatar:`${global.config.Avatar}`
  }
  if(email !== user.email || savecode !== v.get("body.code")){
    throw new global.errs.CheckCodeError()
  }
  const r = await User.create(user)
  success()
})

router.post('/supermanager', async (ctx)=>{
  const v = await new RegisterValidator().validate(ctx)
  const user = {
    email: v.get('body.email'),
    password: v.get('body.password2'),
    nickname: v.get('body.nickname'),
    level:32,
    avatar:`${global.config.Avatar}`
  }
  const r = await User.create(user)
  success()
})

router.get("/userinfo", new Auth().m, async (ctx) =>{
  const user = await User.findOne({
    where:{
      id:ctx.auth.uid
    },
    attributes:[
      "nickname",
      "avatar",
      "email"
    ]
  })
  success(user.dataValues)
})
module.exports = router
