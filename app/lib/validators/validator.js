const { LinValidator,Rule } = require("../../../core/lin-validator")
const {User} = require("../../models/user")

const {LoginType} = require("../enum")

class PositiveIntegerValidator extends LinValidator{
  constructor(){
    super()
    this.id = [
      new Rule('isInt','需要是正整数',{min:1})
    ]
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
        max:12
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
class FollowValidator extends LinValidator{
  constructor(){
    super()
    this.fid = [
      new Rule('isInt','需要是正整数',{min:1})
    ],
    this.uid = [
      new Rule('isInt','需要是正整数',{min:1})
    ]
  }
  async validateUser(vals){
    const id = vals.body.fid
    console.log(id)
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
// class LikeValidator extends PositiveIntegerValidator{
//   constructor(){
//     super()
//   }
// }


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
  FollowValidator
}
