const {db} = require("../../core/db")

async function sqlTemp(days,sql){
  if(typeof sql == "Object"){
    sql = sql
  }
  let data = []
  if(days>30){
    days=30
  }
  for(let i = 0; i <= days ; i++){
    let day = await db.query(sql(i))
    data.unshift(day[0][0])
  }
  return data
}
module.exports = {
  sqlTemp
}