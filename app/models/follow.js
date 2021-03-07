const  {db} = require("../../core/db")

const {Model,Sequelize} = require('sequelize')
const {User} = require("./user")
const {FollowMineError} = require("../../core/http-exception")
const {Log} = require("./log")
class Follow extends Model{
  static async follow(uid,fid){
    if(uid==fid){
      throw new FollowMineError()
    }
    const follow = await Follow.findOne({
      where:{
        uid,
        fid
      }
    })
    if(follow){
      db.transaction(async t=>{
        await Follow.destroy({
          where:{
            uid,
            fid
          }
        },{transaction:t})
        const followuser = await User.findOne({
          where:{
            id:uid
          }
        })
        await followuser.decrement("follow_nums",{
          by:1,transaction:t
        })
        const fanuser = await User.findOne({
          where:{
            id:fid
          }
        })
        await fanuser.decrement("fans_nums",{
          by:1,transaction:t
        })
      })
      await Log.create({
        uid:uid,
        target_id:fid,
        type:"关注",
        info:"取消关注",
      })
    }
    else{
      db.transaction(async t=>{
        await Follow.create({
          uid,
          fid
        },{transaction:t})
        const followuser = await User.findOne({
          where:{
            id:uid
          }
        })
        await followuser.increment("follow_nums",{
          by:1,transaction:t
        })
        const fanuser = await User.findOne({
          where:{
            id:fid
          }
        })
        await fanuser.increment("fans_nums",{
          by:1,transaction:t
        })
      })
      await Log.create({
        uid:uid,
        target_id:fid,
        type:"关注",
        info:"关注",
      })
    }
  }

}
Follow.init({
  uid:{
    type:Sequelize.INTEGER
  },
  fid:{
    type:Sequelize.INTEGER
  }
},{
  sequelize:db,
  tableName:"follow"
})

module.exports = {
  Follow
}


