"use strict"

const UpdateUserAction = require('./update.user.action')
const GetAttacsAction = require('./get.attacks.action')

const types = {
  0: UpdateUserAction,
  1: GetAttacsAction
}

module.exports = (actionData, callbacks) => new types[actionData.type](actionData, callbacks)