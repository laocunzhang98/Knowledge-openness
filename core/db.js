const Sequelize = require("sequelize")
const {
  dbName,
  user,
  host,
  port,
  password
} = require('../config/config').database

const sequelize = new Sequelize(dbName,user,password,{
  dialect:'mysql',
  host:host,
  port:port,
  logging:false,
  timezone:'+08:00',
  define:{
    timestamps:true,
    paranoid:true
  }
})
sequelize.sync({
  force:false
})

module.exports = {
  db:sequelize
}


