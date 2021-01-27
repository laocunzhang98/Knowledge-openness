
module.exports = {
  environment:'dev',
  database:{
    dbName:'islang',
    host:'localhost',
    port:3306,
    user:'root',
    password:'www7581501'
  },
  security: {
    secretKey: "abcdefg",
    expiresIn: 60*60*24
  },
  wx:{
    appId:'wxb3546583189531a7',
    appSecret:'12452bd44dc75d34a8f5d9a4e6526e2a',
    loginUrl:'https://api.weixin.qq.com/sns/jscode2session?appid=%s&secret=%s&js_code=%s&grant_type=authorization_code'
  },
  Basepath:"http://localhost:3000",
  Avatar:"http://localhost:3000/user/avatar.jpg"
}