const Koa = require("Koa")
const InitManager = require('./core/init')
const parser = require('koa-bodyparser')
const catchError = require('./middlewares/exception')
const static = require('koa-static')
const path =require("path")
const {Notice} = require("./app/models/notice")

const app = new Koa()
const server = require('http').createServer(app.callback())

const io = require('socket.io')(server, {
  transports: ['websocket']
})

app.use(async (ctx, next) => {
  ctx.set("Access-Control-Allow-Origin", "*")
  ctx.set("Access-Control-Allow-Methods", "*");
  ctx.set("X-Powered-By", ' 3.2.1');
  ctx.set("Access-Control-Allow-Headers", "Content-Type,Access-Token")
  await next()
})

io.on("connection",async function(socket){
  console.log("连接成功！")
  await socket.on("disconnect",async ()=>{
    console.log(socket.id)
    await Notice.deluid(socket.id)
  })
  
  

  await socket.on("comment",async (val)=>{
    const socket_id = await Notice.find(val)
    if(!socket_id){
      // 提示信息存储到数据库
      // await Notice.link(val,socket.id)
    }
    else{
      let data = {
        name:"wangwei",
        age:18
      }
      setTimeout(() => {
        io.to(socket_id).emit("reply",data)
      }, 2000);
    }

  })
  await socket.on("uid",async (val)=>{
    await Notice.link(val,socket.id)
    setTimeout(() => {
      console.log(val)
    }, 1000);
  })
})

app.use(static(path.join(__dirname, "/public/uploads")))
app.use(catchError)
app.use(parser())
InitManager.initCore(app)


server.listen(3000)

