const Koa = require("Koa")
const InitManager = require('./core/init')
const parser = require('koa-bodyparser')
const catchError = require('./middlewares/exception')
const static = require('koa-static')
const path =require("path")
// require('./app/models/user')

const app = new Koa()

app.use(async (ctx, next) => {
  ctx.set("Access-Control-Allow-Origin", "*")
  ctx.set("Access-Control-Allow-Methods", "*");
  ctx.set("X-Powered-By", ' 3.2.1');
  ctx.set("Access-Control-Allow-Headers", "Content-Type,Access-Token")
  await next()
})
app.use(static(path.join(__dirname, "/public/uploads")))
app.use(catchError)
app.use(parser())

InitManager.initCore(app)

app.listen(3000)

