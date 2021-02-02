"use strict";

const Action = require('./action')

class StartAdventureAction extends Action {

  constructor(user, callbacks) {
    super(user, callbacks)
    // this.actionName = 'startAdventure'
    // this.controller = 'hero'
    // this.action = 'startAdventure'
  }

  params() {
    return {userId: user.userId}
  }
}

StartAdventureAction.type = 10

module.exports = StartAdventureAction