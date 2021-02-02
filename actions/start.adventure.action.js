"use strict";

const Action = require('./action')

class StartAdventureAction extends Action {

  constructor(data, callbacks) {
    super(data, callbacks)
    // this.actionName = 'updateHeroProduction'
    // this.controller = 'hero'
    // this.action = 'addAttributePoints'
  }

  params() {
    return {}
  }
}

StartAdventureAction.type = 10

module.exports = StartAdventureAction