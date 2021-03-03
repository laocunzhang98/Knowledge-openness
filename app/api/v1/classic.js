const Router = require("koa-router")
const { Auth,OrgAuth,OrgArticle} = require('../../../middlewares/auth')
const { Op, Sequelize } = require("sequelize")
const { success } = require("../../lib/helper")
const { Article } = require("../../models/article")
const upload = require('../../routes/upload')
const { User } = require("../../models/user")
const { ArticleValidator, ArticleInfoValidator, UpdateArticle } = require("../../lib/validators/validator")
const { db } = require("../../../core/db")
const {Organize} = require("../../models/Organize")


const router = new Router({
  prefix: '/v1/classic',
})
let date = new Date()
let month = date.getMonth() + 1
let day = date.getDate()
const temp = {
  year: date.getFullYear(),
  month: month < 10 ? "0" + month : month,
  day: day < 10 ? "0" + day : day
}
// upload.single('file'),
// 更新文章
router.post("/update", new Auth().m, upload.single('file'), async (ctx, next) => {
  // const v = await new UpdateArticle().validate(ctx)
  let url
  try {
    url = global.config.Basepath + `/article/${temp.year}${temp.month}${temp.day}/${ctx.req.file.filename}`
  } catch (error) {
    url = ""
  }
  await Article.update({
    title: ctx.request.body.title,
    label: ctx.request.body.label,
    content: ctx.request.body.content,
    rcontent: ctx.request.body.rcontent,
    image: ctx.request.body.image,
    classify_name: ctx.request.body.classify,
    public: ctx.request.body.public,
    organize_id: ctx.request.body.organize_id
  },
    {
      where: {
        id: ctx.request.body.article_id
      }
    })
  success({ article_id: ctx.request.body.article_id, title: ctx.request.body.title }, "修改文章成功,快去看看吧！")
})
// 发表文章
router.post('/pub', new Auth().m, upload.single('file'), async (ctx, next) => {
  // let name = ctx.req.file.originalname
  const v = await new ArticleInfoValidator().validate(ctx)
  let url
  try {
    url = global.config.Basepath + `/article/${temp.year}${temp.month}${temp.day}/${ctx.req.file.filename}`
  } catch (error) {
    url = ""
  }
  const article = await Article.create({
    title: ctx.request.body.title,
    label: ctx.request.body.label,
    content: ctx.request.body.content,
    rcontent: ctx.request.body.rcontent,
    image: ctx.request.body.image,
    classify_name: ctx.request.body.classify,
    uid: ctx.auth.uid,
    public: ctx.request.body.public,
    organize_id: ctx.request.body.organize_id
  })
  success({ article_id: article.id, title: article.title }, "发表成功,快去看看吧！")
})
// 通过文章返回用户信息
router.get('/article/follow/:id', new Auth().m, new OrgArticle().k,async (ctx, next) => {
  const v = await new ArticleValidator().validate(ctx)
  // console.log(v.get("path.id"))
  const article_id = ctx.params.id
  const article = await Article.findOne({
    where: {
      id: article_id
    },
    attributes: ["uid"]
  })
  if (!article) {
    throw new global.errs.NotFound()
  }
  const user = await User.findOne({
    where: {
      id: article.dataValues.uid
    },
    attributes: ["avatar", "nickname", "id"]
  })
  success(user.dataValues)
})
// 获取文章信息
router.get('/article/:id', new Auth().m, async (ctx, next) => {
  // const v = await new ArticleValidator().validate(ctx)
  const article_id = ctx.params.id
  const article = await Article.findOne({
    where: {
      id: article_id
    }
  })
  if (!article) {
    throw new global.errs.NotFound()
  }

  const user = await User.findOne({
    where: {
      id: article.uid
    },
    attributes: ["nickname", "job", "describe"]
  })
  article.dataValues.nickname = user.nickname
  article.dataValues.job = user.job
  article.dataValues.describe = user.describe
  await article.increment('read_nums', {
    by: 1
  })
  success(article.dataValues)
})
// 获取文章列表
router.get('/latest', new Auth().m, async (ctx, next) => {
  let pageSize = parseInt(ctx.query.pageSize) || 10
  let id = ctx.query.article_id || ""
  let page = ctx.query.page || 0
  let word = ctx.query.word || ''
  let public = ctx.query.public || 1
  const r = await Article.findAndCountAll({
    order: [
      ["createdAt", "desc"]
    ],
    where: {
      id: {
        [Op.ne]: id
      },
      title: {
        [Op.like]: `%${word}%`
      },
      public: public
    },
    offset: pageSize * page,
    limit: pageSize
  })

  const result = []
  for (let i = 0; i < r.rows.length; i++) {
    const user = await User.findOne({
      where: {
        id: r.rows[i].uid
      }
    })
    let data = r.rows[i].dataValues
    data.name = user.nickname
    result.push(data)
  }

  success({
    data: result,
    countSize: r.count
  })
})
// 获取用户文章列表 
router.get("/userarticle", new Auth().m, async (ctx) => {
  let uid = ctx.query.uid || ctx.auth.uid
  const article = await Article.findAll({
    where: {
      uid: uid,
      public:1
    }
  })
  const user = await User.findOne({
    where: {
      id: uid
    },
    attributes: ["nickname"]
  })
  for (let item of article) {
    item.dataValues.name = user.nickname
  }
  success(article)
})
// 获取用户文章总点赞量和阅读量
router.get("/articleAll", new Auth().m, async ctx => {
  let uid = ctx.query.id || ctx.auth.uid
  const article = await Article.findAll({
    where: {
      uid: uid
    },
    attributes: [[db.fn("SUM", db.col("read_nums")), "all_reads"], [db.fn("sum", db.col("fav_nums")), "all_favs"]]
  })
  success(article)
})
// 获取圈子文章列表
router.get("/orglatest", new Auth().m, async ctx => {
  let pageSize = parseInt(ctx.query.pageSize) || 10
  let organize_id = parseInt(ctx.query.organize_id)
  let page = ctx.query.page || 0
  const r = await Article.findAndCountAll({
    order: [
      ["createdAt", "desc"]
    ],
    where: {
      organize_id: organize_id
    },
    offset: pageSize * page,
    limit: pageSize
  })

  const result = []
  for (let i = 0; i < r.rows.length; i++) {
    const user = await User.findOne({
      where: {
        id: r.rows[i].uid
      }
    })
    let data = r.rows[i].dataValues
    data.name = user.nickname
    result.push(data)
  }

  success({
    data: result,
    countSize: r.count
  })
})
// 删除文章 (软删除)
router.delete("/del", new Auth().m, async ctx => {
  const uid = ctx.auth.uid
  const organize_id = ctx.request.body.organize_id || 0
  if(!organize_id){
    await Article.update({public:0},{
      where:{
        uid:uid,
        id:ctx.request.body.article_id
      }
    })
  }
  else{
    const org = await Organize.findOne({
      where:{
        member_id:uid,
        team_id:organize_id,
        level:{
          [Op.gte]:16
        }
      }
    })
    if(org){
      await Article.destroy({
        where:{
          id:ctx.request.body.article_id
        }
      }
    )
    }
    else{
      throw new Error("参数错误")
    }
  }
  success("删除成功!","删除成功!")
})


module.exports = router
