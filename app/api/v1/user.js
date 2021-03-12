const Router = require("koa-router")
const nodeMailer = require('nodemailer')
const Redis = require('koa-redis')
const { User } = require('../../models/user')
const { Notice } = require('../../models/notice')
const { RegisterValidator, EmailValidator } = require('../../lib/validators/validator')
const { success } = require('../../lib/helper')
const { Auth } = require("../../../middlewares/auth")
const {Op, where} = require("sequelize")
const router = new Router({
  prefix: '/v1/user'
})

const Store = new Redis().client
// 发送邮件
router.post('/sendmail', async (ctx) => {
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
    get expire() {
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
  console.log("code is :", code)
  let transporter = nodeMailer.createTransport(transportOptions)
  // send mail
  let info

  try {
    info = await transporter.sendMail(sendMailOptions)
    Store.hmset(`${sendMailOptions.to}`, 'code', code.toLocaleLowerCase())
    Store.hmset(`${sendMailOptions.to}`, 'expire', conf.expire)
    Store.hmset(`${sendMailOptions.to}`, 'email', sendMailOptions.to)
  } catch (error) {
    throw new global.errs.EmailError()
  }
  if (info) {
    success('SUCCESS', '邮件发送成功')
  }
})
// 注册
router.post('/register', async (ctx) => {
  // 接收参数
  const v = await new RegisterValidator().validate(ctx)
  const savecode = await Store.hget(`${v.get("body.email")}`, 'code')
  const expire = await Store.hget(`${v.get("body.email")}`, 'expire')
  const email = await Store.hget(`${v.get("body.email")}`, 'email')
  const user = {
    email: v.get('body.email'),
    password: v.get('body.password2'),
    nickname: v.get('body.nickname'),
    job:"自由职业",
    describe:"我还没想好怎么介绍自己呢!",
    avatar: `${global.config.Avatar}`,
  }
  if (email !== user.email || savecode !== v.get("body.code").toLocaleLowerCase()) {
    throw new global.errs.CheckCodeError()
  }
  const r = await User.create(user)
  success('注册成功', "注册成功")
})
// 超级管理员
router.post('/supermanager', async (ctx) => {
  const v = await new RegisterValidator().validate(ctx)
  const user = {
    email: v.get('body.email'),
    password: v.get('body.password2'),
    nickname: v.get('body.nickname'),
    level: 32,
    avatar: `${global.config.Avatar}`
  }
  const r = await User.create(user)
  success()
})
// 获取个人信息
router.get("/userinfo", new Auth().m, async (ctx) => {
  let id = ctx.query.id || ctx.auth.uid
  const user = await User.findOne({
    where: {
      id: id
    },
    attributes: [
      "nickname",
      "avatar",
      "email",
      "id",
      "job",
      "describe",
      "fans_nums",
      "follow_nums"
    ]
  })
  if(!user){
    throw new global.errs.NotFound()
  }
  success(user)
})

// 更新信息
router.put("/update", new Auth().m, async ctx => {
  let data = {
  }
  let avatar = ctx.request.body.avatar || ''
  let nickname = ctx.request.body.nickname || ''
  let job = ctx.request.body.job || ''
  let describe = ctx.request.body.describe || ''
  if(avatar){
    data.avatar = avatar
  }
  if(nickname){
    data.nickname = nickname
  }
  if(job){
    data.job = job
  }
  if(describe){
    data.describe = describe
  }
  const user = await User.update(data,
    {
      where: {
        id: ctx.auth.uid
      }

    })
  success("success","审核中")
})

// 查询用户数据
router.get("/admin",new Auth(32).m,async ctx => {
  const users = await User.findAndCountAll({
    order: [
      ["createdAt", "desc"]
    ],
    offset:0,
    limit:10
  })
  for(let user of users.rows){
    let notice = await Notice.findOne({
      where:{
        uid:user.id
      }
    })
    user.dataValues.lastDate = notice.updatedAt
  }
  success(users)
})
// 管理员获取管理员列表
router.get("/manager", new Auth(32).m,async ctx =>{
  const users = await User.findAll({
    where:{
      level:{
        [Op.gte]:16
      }
    }
  })
  success(users)
})
// 管理员获取用户信息
router.get("/admin/info",new Auth(16).m,async ctx=>{
  const user = await User.findOne({
    where:{
      id:ctx.query.uid
    },
    attributes:{
      exclude:["password"]
    }
  })
  success(user)
})
// 管理员修改用户信息
router.post("/admin/upinfo",new Auth(16).m,async ctx=>{
  let userInfo = ctx.request.body
  await User.update(userInfo,{
    where:{
      id:userInfo.id
    }
  })
  success("更新成功","更新成功")
})
// 修改管理员权限
router.post("/admin/limit", new Auth(32).m,async ctx=>{
  await User.update({
    level:ctx.request.body.level
  },{where:{
    id:ctx.request.body.id
  }})
  success("修改成功!","修改成功!")
})
module.exports = router
