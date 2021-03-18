const  {db} = require("../../core/db")
const {Model,Sequelize} = require('sequelize')
const {Article}  = require('./article')
const {Log} = require("./log")
class Favor extends Model{
  static async like(article_id,uid){
    const favor = await Favor.findOne({
      where:{
        article_id,
        uid
      }
    })
    if(favor){
      throw new global.errs.LikeError()
    }
    // 1.添加记录
    // 2.article fav_nums
    // 数据库事务
    return db.transaction(async t=>{
      await Favor.create({
        article_id,
        uid
      },{transaction:t})
      const article = await Article.findOne({
        where:{
          id:article_id
        }
      })
      await article.increment('fav_nums',{
        by:1,transaction:t
      })
      await Log.create({
        uid:uid,
        target_id:article_id,
        type:"点赞",
        info:"喜欢文章",
        team_id: 0
      })
    })
  }
}

Favor.init({
  uid:Sequelize.INTEGER,
  article_id:Sequelize.STRING,
},{
  sequelize:db,
  tableName:"favor"
})

module.exports = {
  Favor
}
