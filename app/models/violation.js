const  {db} = require("../../core/db")
const {Model,Sequelize,DataTypes} = require('sequelize')

class Violation extends Model{

}
Violation.init({
  viouid:{
    type: Sequelize.INTEGER,
  },
  vioid:{
    type: DataTypes.UUID,
  },
  viotype:{
    type: Sequelize.STRING
  },
  vioinfo:{
    type: Sequelize.STRING
  },
},{
  sequelize:db,
  tableName:"violation_info"
})




module.exports = {
  Violation
}
