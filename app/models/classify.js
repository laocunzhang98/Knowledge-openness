const {db}  =  require("../../core/db")
const {Model,Sequelize} = require("sequelize")

class Classify extends Model{

}
Classify.init({
  classify_name:Sequelize.STRING 
},{
  sequelize:db,
  tableName:"classify"
})

module.exports = {
  Classify
}
