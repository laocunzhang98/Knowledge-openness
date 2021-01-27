const requireDirectory = require("require-directory")
const Router = require("koa-router")

class InitManager{
  static initCore(app){
    InitManager.app = app
    InitManager.initLoadRouters()
    InitManager.loadConfig()
  }
  static loadConfig(path = ""){
    const configPath = '../config/config.js'
    const config = require(configPath)
    global.config = config
    global.errs = require('./http-exception')
  }
  static initLoadRouters(){
    
    requireDirectory(module,'../app/api/',{
      visit:whenLoadModule
    })
    function whenLoadModule(obj){
      if(obj instanceof Router){
        InitManager.app.use(obj.routes())
        InitManager.app.use(obj.allowedMethods());
      }
    }
  }
}

module.exports = InitManager
