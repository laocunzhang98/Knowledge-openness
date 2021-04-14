const multer = require('koa-multer')
const fs = require("fs")
const path = require("path")

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
    console.log(file);
    let newpath  = path.join(process.cwd(),`public/uploads/files/`+temp.year + temp.month + temp.day)
    if(!fs.existsSync(newpath)){
      fs.mkdirSync(newpath)
    }
    cb(null,newpath)
  },
  filename: function(req,file,cb){
    const fileFormat = (file.originalname).split(".")
    cb(null, Date.now() + "." + fileFormat[fileFormat.length - 1]);

  }
})
const file =  multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 20 // 限制15M
  }
});


module.exports = file
