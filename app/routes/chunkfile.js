const multer = require('koa-multer')
const basicAuth = require('basic-auth')
const jwt = require('jsonwebtoken')
const fs = require("fs")
const path = require("path")
const multiparty = require("multiparty");
const { fields } = require('./upload')

let date = new Date() 
let month = date.getMonth()+1
let day = date.getDate()
const temp = {
  year:date.getFullYear(),
  month:month<10?"0"+month:month,
  day:day<10?"0"+day:day
}
const storage = multer.diskStorage({
  destination: function(req,file,cb){
    // 验证token 返回uid 根据uid 创建多级目录
    const userToken = basicAuth(req)
    var decode = jwt.verify(userToken.name,global.config.security.secretKey)
    let newpath = path.join(process.cwd(),`public/uploads/chunkfiles/`+temp.year + temp.month + temp.day)
    let snewpath = path.join(newpath,`${decode.uid}`)
    // 创建多级目录
    if(!fs.existsSync(newpath)){
      fs.mkdirSync(newpath)
    }
    if(!fs.existsSync(snewpath)){
      fs.mkdirSync(snewpath)
    }
    cb(null,snewpath)
  },

  // 别名
  filename: function(req,file,cb){
    console.log(file);
    const fileFormat = (file.originalname).split(".")
    cb(null, Date.now() + "." + fileFormat[fileFormat.length - 1]);
  }
})
const chunkfile =  multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 20 // 限制15M
  }
});


module.exports = chunkfile
