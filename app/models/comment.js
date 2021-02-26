const {db}  =  require("../../core/db")
const {Model,Sequelize,DataTypes} = require("sequelize")
const {Article}  = require('./article')


class Comment extends Model{
  static async comment(article_id,article_uid,uid,oid,content,comment_id){
    return db.transaction(async t=>{
      const comment = await Comment.create({
        article_id,
        article_uid,
        uid,
        oid,
        content,
        comment_id
      },{transaction:t})
      const article = await Article.findOne({
        where:{
          id:article_id
        }
      })
      await article.increment('com_nums',{
        by:1,transaction:t
      })
      return comment
    })
  }
}

Comment.init({
  article_id:{
    type:DataTypes.UUID
  },
  article_uid:{
    type:Sequelize.INTEGER
  },
  comment_id:{
    type:Sequelize.INTEGER
  },
  uid:{
    type:Sequelize.INTEGER
  },
  oid:{
    type:Sequelize.INTEGER,
    defaultValue:0
  },
  content:{
    type:DataTypes.TEXT
  }
},{
  sequelize:db
})


module.exports = {
  Comment
}

