"use strict";

const Action = require('./action')

class StartAdventureAction extends Action {

  constructor(user, callbacks) {
    super(user, callbacks)
    this.actionName = 'startAdventure'
    this.controller = 'quest'
    this.action = 'dialogAction'
  }

  params() {
    return {
      command: "activate",
      dialogId: 0,
      questId: 991
    }
  }
}

StartAdventureAction.type = 10

module.exports = StartAdventureAction