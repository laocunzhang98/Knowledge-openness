const { LinValidator,Rule } = require("../../../core/lin-validator")
const {User} = require("../../models/user")
const {Article} = require("../../models/article")
const {Files} = require("../../models/files")
const {LoginType} = require("../enum")
const {Organize} =  require("../../models/Organize")
class PositiveIntegerValidator extends LinValidator{
  constructor(){
    super()
    this.id = [
      new Rule('isInt','需要是正整数',{min:1})
    ]
  }
}

class RegisterValidator extends LinValidator{
  constructor(){
    super()
    this.email = [
      new Rule("isEmail",'不符合email规范')
    ]
    this.password1 = [
      new Rule('isLength','密码至少6个字符,最多32位字符',{
        min:6,
        max:32
      }),
      new Rule('matches','密码不符合规范','^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,32}$')
    ]
    this.password2 = this.password1
    this.nickname = [
      new Rule('isLength','昵称长度为2-12位',{
        min:2,
        max:12
      }),
    ]
  }
  async validatePassword(vals){
    const psw1 = vals.body.password1
    const psw2 = vals.body.password2
    if(psw1 !== psw2){
      throw new Error('两个密码必须相同')
    }
  }
  async validateEmail(vals){
    const email = vals.body.email
    const user = await User.findOne({
      where:{
        email:email
      }
    })
    if(user){
      throw new Error('email已存在')
    }
  }
}
class EmailValidator extends LinValidator{
  constructor(){
    super()
    this.email = [
      new Rule("isEmail",'不符合email规范')
    ]
  }
  async validateEmail(vals){
    const email = vals.body.email
    const user = await User.findOne({
      where:{
        email:email
      }
    })
    if(user){
      throw new Error('email已存在')
    }
  }
}
class TokenValidator extends LinValidator{
  constructor(){
    super()
    this.account = [
      new Rule('isLength','不符合账号规则',{
        min:4,
        max:32
      })
    ]
    
    this.secret = [
      new Rule('isOptional'),
      new Rule('isLength','至少6个字符',{
        min:6,
        max:20
      })
    ]
  }
  validateLoginType(vals){
    
    if(!vals.body.type){
      throw new Error('type是必须参数')
    }
    if(!LoginType.isThisType(vals.body.type)){
      throw new Error('type参数不合法')
    }
  }
}
class LoginValidator extends LinValidator{
  constructor(){
    super()
    this.account = [
      new Rule('isLength','不符合账号规则',{
        min:4,
        max:32
      })
    ]
    this.secret = [
      new Rule('isOptional'),
      new Rule('isLength','至少6个字符',{
        min:6,
        max:12
      })
    ]
  }
}
class LabelValidator extends LinValidator{
  constructor(){
    super()
    this.label_name = [
      new Rule('isLength','标签长度不能大于10',{
        max:10
      })
    ]
  }
}
class ArticleInfoValidator extends LinValidator{
  constructor(){
    super()
    this.title = [
      new Rule("isLength","标题不能为空",{min:1,max:30})
    ]
    this.content = [
      new Rule("isLength","内容不能为空",{min:1})
    ]
  }
}
class ArticleValidator extends LinValidator{
  constructor(){
    super()
    this.id = [
      new Rule("isUUID","该资源已消失")
    ]
  }
}
class CommentValidator extends LinValidator{
  constructor(){
    super()
    this.article_id = [
      new Rule("isUUID","该资源不存在")
    ]
    this.content = [
      new Rule('isLength','不允许为空',{
        min:1
      })
    ]
  }
  async validateAuthor(vals){
    const article = await Article.findOne({
      where:{
        id:vals.body.article_id,
        uid:vals.body.article_uid
      }
    })
    if(!article){
      throw new Error("参数错误")
    }
  }
}
class UpdateArticle extends CommentValidator{
  constructor(){
    super()
  }
}
class FollowValidator extends LinValidator{
  constructor(){
    super()
    this.fid = [
      new Rule('isInt','需要是正整数',{min:1})
    ]
  }
  
  async validateUser(vals){
    const id = vals.body.fid
    const user = await User.findOne({
      where:{
        id:id
      }
    })
    if(!user){
      throw new Error('关注的该用户不存在')
    }
  }
}
class FolderValidator extends LinValidator{
  constructor(){
    super()
  }
  async validateFolder(vals){
    if(vals.body.parent_fileid&&vals.body.parent_filename){
      const id = vals.body.parent_fileid
      const origin_name = vals.body.parent_filename
      const files = await Files.findOne({
        where:{
          id:id,
          origin_name:origin_name
        }
      })
      if(!files){
        throw new Error('参数错误')
      }
    }
  }
}

class OrgMemberValidator extends LinValidator{
  constructor(){
    super()
  }
  async validateMember(vals){
    console.log(vals)
  }
}
class NotEmptyValidator extends LinValidator{
  constructor(){
    super()
    this.token = [
      new Rule('isLength','不允许为空',{
        min:1
      })
    ]
  }
}
class OrgLimitMemberValidator extends LinValidator{
  constructor(){
    super()
  }
  async validateLimit(vals){
    const org = await Organize.findOne({
      where:{
        team_id:vals.body.team_id
      }
    })
    if(!org){
      throw new Error("不存在该饭圈！")
    }
    if(org.total>=org.limit_total){
      throw new Error("人数达到上限！")
    }
  }
}
class OrgInfoValidator extends LinValidator{
  constructor(){
    super()
    this.team_name = [
      new Rule('isLength',"长度为2-20个字符",{
        min:2,
        max:20
      })
    ],
    this.describe = [
      new Rule("isLength","长度为5-200个字符",{
        min:5,
        max:200
      })
    ]
  }
}



module.exports = {
  PositiveIntegerValidator,
  RegisterValidator,
  TokenValidator,
  NotEmptyValidator,
  LoginValidator,
  EmailValidator,
  LabelValidator,
  ArticleValidator,
  ArticleInfoValidator,
  FollowValidator,
  CommentValidator,
  UpdateArticle,
  FolderValidator,
  OrgMemberValidator,
  OrgInfoValidator,
  OrgLimitMemberValidator
}
