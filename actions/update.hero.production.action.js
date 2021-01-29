"use strict";

const Action = require('./action')

class UpdateHeroProductionAction extends Action {

  constructor(data, callbacks) {
    super(data, callbacks)
    this.actionName = 'updateHeroProduction'
    this.controller = 'hero'
    this.action = 'addAttributePoints'
    this.params = () => ({
      attBonusPoints: 0,
      defBonusPoints: 0,
      fightStrengthPoints: 0,
      resBonusPoints: 0,
      resBonusType: data.resourceId
    })
    this.getData = data => data
  }
}

module.exports = UpdateHeroProductionAction