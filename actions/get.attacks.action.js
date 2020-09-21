"use strict";

const Action = require('./action')

class GetAttacksAction extends Action {
  constructor(data, callbacks = []) {
    super(data, callbacks)

    this.actionName = 'updateUserAttacks'
    this.controller = 'village'
    this.action = 'getKingdomVillageAttacks'
    this.params = () => ({})
    this.getData = data => data.cache
  }

  callback (data) {
    super.callback(data)
  }
}

module.exports = GetAttacksAction