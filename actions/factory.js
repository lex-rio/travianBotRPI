"use strict"

const UpdateUserAction = require('./update.user.action')
// const GetAttacksAction = require('./get.attacks.action')
const SendFamrAction = require('./send.farm.action')
const SendMerchantsAction = require('./action')
const SendAttackAction = require('./action')
const SendSupportAction = require('./action')
const AddToBuildQueAction = require('./action')
const GetLastReportsAction = require('./get.last.reports.action')
const UpdateHeroProductionAction = require('./update.hero.production.action')

const types = {
  0: 'UpdateUserAction',
  // 1: 'GetAttacksAction',
  2: 'SendFamrAction',
  3: 'SendMerchantsAction',
  4: 'SendAttackAction',
  5: 'SendSupportAction',
  6: 'AddToBuildQueAction',
  7: 'GetMessagesAction',
  8: 'GetLastReportsAction',
  9: 'UpdateHeroProductionAction'
}
const classes = {
  UpdateUserAction,
  // GetAttacksAction,
  SendFamrAction,
  SendMerchantsAction,
  SendAttackAction,
  SendSupportAction,
  AddToBuildQueAction,
  GetLastReportsAction,
  UpdateHeroProductionAction
}

const actionFactory = (actionData, callbacks) => new classes[types[actionData.type]](actionData, callbacks)

module.exports = { actionFactory, types, classes }