"use strict"

const classes = {
  UpdateUserAction: require('./update.user.action'),
  SendFamrAction: require('./send.farm.action'),
  // SendMerchantsAction: require('./action'),
  // SendAttackAction: require('./action'),
  SendSupportAction: require('./send.support.action'),
  // AddToBuildQueAction: require('./action'),
  GetLastReportsAction: require('./get.last.reports.action'),
  UpdateHeroProductionAction: require('./update.hero.production.action'),
  StartAdventureAction: require('./start.adventure.action'),
  FinishBuildingAction: require('./finish.building.action')
}

const actionFactory = (actionData, callbacks) => {
  try {
    const actionClass = Object.values(classes).find(({ type }) => type === actionData.type)
    return new actionClass(actionData, callbacks)
  } catch (e) {
    console.log(e.message)
  }
}

module.exports = { actionFactory, classes }