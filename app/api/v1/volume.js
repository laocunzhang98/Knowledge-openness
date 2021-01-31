const Router = require('koa-router')
const { Auth } = require('../../../middlewares/auth')
const {PositiveIntegerValidator} = require("../../lib/validators/validator")

const {success} = require('../../lib/helper')
const article = require('../../models/article')
const router = new Router({
  prefix:'/v1/volume'
})