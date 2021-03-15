"use strict"

const classes = {
  InitUserAction: require('./init.user.action'),
  UpdateUserAction: require('./update.user.action'),
  SendFamrAction: require('./send.farm.action'),
  // SendMerchantsAction: require('./action'),
  // SendAttackAction: require('./action'),
  SendSupportAction: require('./send.support.action'),
  // AddToBuildQueAction: require('./action'),
  GetLastReportsAction: require('./get.last.reports.action'),
  UpdateHeroProductionAction: require('./update.hero.production.action'),
  StartAdventureAction: require('./start.adventure.action'),
  FinishBuildingAction: require('./finish.building.action'),
  GetKingdomAttacks: require('./get.kingdom.attacks.action'),
  // GetCeilsInfo: require('./get.ceils.info.js')
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