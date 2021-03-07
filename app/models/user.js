const bcrypt = require("bcryptjs")
const  {db} = require("../../core/db")

const {Sequelize,Model} = require('sequelize')

class User extends Model {
  static async verifyEmailPassword(email,plainPassword){
    const user = await User.findOne({
      where:{
        email
      }
    })
    if(!user){
      throw new global.errs.AuthFailed('用户不存在')
    }
    const correct = await bcrypt.compareSync(plainPassword,user.password)
    if(!correct){
      throw new global.errs.AuthFailed('密码不正确')
    }
    return user
  }
  static async getUserByOpenid(openid){
    const user = await User.findOne({
      where:{
        openid
      }
    })
    return user
  }
  static async verifySuperManager(email){
    const level =  await User.findOne({
      where:{
        email:email
      },
      attributes:["level"]
    })
    return level
  }
  static async registerByOpenid(openid){
    return await User.create({
      openid
    })
  }
}

User.init({
  id:{
    type:Sequelize.INTEGER,
    primaryKey:true,
    autoIncrement:true
  },
  nickname:Sequelize.STRING,
  email:{
    type:Sequelize.STRING(64),
    unique:true
  },
  password:{
    type:Sequelize.STRING,
    set(val){
      // model 属性操作
      const salt = bcrypt.genSaltSync(10)
      const psw = bcrypt.hashSync(val,salt)
      this.setDataValue('password',psw)
    }
  },
  openid:{
    type:Sequelize.STRING(64),
    unique:true
  },
  avatar:{
    type:Sequelize.STRING
  },
  level:{
    type:Sequelize.INTEGER,
    defaultValue:8
  },
  fans_nums:{
    type:Sequelize.INTEGER,
    defaultValue:0
  },
  follow_nums:{
    type:Sequelize.INTEGER,
    defaultValue:0
  },
  job:{
    type:Sequelize.STRING(20)
  },
  describe:{
    type:Sequelize.STRING
  }
},{
  sequelize:db,
  tableName:'user'
})


module.exports = {
  User
}

