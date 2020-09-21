"use strict"

const UpdateUserAction = require('./update.user.action')
const GetAttacksAction = require('./get.attacks.action')
const SendFamrAction = require('./action')
const SendMerchantsAction = require('./action')
const SendAttackAction = require('./action')
const SendSupportAction = require('./action')
const AddToBuildQueAction = require('./action')

const types = {
  0: 'UpdateUserAction',
  1: 'GetAttacksAction',
  2: 'SendFamrAction',
  3: 'SendMerchantsAction',
  4: 'SendAttackAction',
  5: 'SendSupportAction',
  6: 'AddToBuildQueAction',
  7: 'GetMessagesAction'
}
const classes = {
  UpdateUserAction,
  GetAttacksAction,
  SendFamrAction,
  SendMerchantsAction,
  SendAttackAction,
  SendSupportAction,
  AddToBuildQueAction
}

const actionFactory = (actionData, callbacks) => new classes[types[actionData.type]](actionData, callbacks)

module.exports = { actionFactory, types }