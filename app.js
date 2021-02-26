const Koa = require("Koa")
const InitManager = require('./core/init')
const parser = require('koa-bodyparser')
const catchError = require('./middlewares/exception')
const static = require('koa-static')
const path =require("path")
// const {Notice,NoticeInfo} = require("./app/models/notice")
const {monitor}  = require("./core/notcie")
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

io.on("connection", async function(socket){
  await monitor(socket,io)
})

app.use(static(path.join(__dirname, "/public/uploads")))
app.use(catchError)
app.use(parser())
InitManager.initCore(app)


server.listen(3000,"10.1.10.75")

