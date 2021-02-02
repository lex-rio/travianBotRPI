"use strict";

const Action = require('./action')

class UpdateHeroProductionAction extends Action {

  constructor(data, callbacks) {
    super(data, callbacks)
    this.resourceId = data.resourceId
    this.actionName = 'updateHeroProduction'
    this.controller = 'hero'
    this.action = 'addAttributePoints'
  }

  params() {
    return {
      attBonusPoints: 0,
      defBonusPoints: 0,
      fightStrengthPoints: 0,
      resBonusPoints: 0,
      resBonusType: this.resourceId
    }
  }
}

UpdateHeroProductionAction.type = 9

module.exports = UpdateHeroProductionAction