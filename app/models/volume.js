const  {db} = require("../../core/db")

const {Sequelize,Model} = require('sequelize')

class Volume extends Model{

}
Volume.init({
  article_id:Sequelize.STRING,
  read_nums:Sequelize.INTEGER,
},{
  sequelize:db,
  tableName:"read_volume"
})


module.exports ={
  Volume
}