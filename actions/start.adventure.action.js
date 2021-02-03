"use strict";

const Action = require('./action')

class StartAdventureAction extends Action {

  constructor(user, callbacks) {
    super(user, callbacks)
    this.actionName = 'dialogAction'
    this.controller = 'quest'
    this.action = 'startAdventure'
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