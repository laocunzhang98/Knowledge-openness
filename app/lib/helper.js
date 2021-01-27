

function success(data,message){
  throw new global.errs.Success(data,message)
}


module.exports = {
  success
}