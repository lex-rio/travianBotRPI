"use strict";

const Action = require('./action')

class SendSupportAction extends Action {

  constructor(data, callbacks) {
    super(data, callbacks)
    this.units = data.units
    this.destVillageId = data.destVillageId
    this.villageId = data.villageId
    this.actionName = 'sendSupportCallback'
    this.controller = 'troops'
    this.action = 'send'
  }

  params() {
    return {
      destVillageId: this.destVillageId,
      villageId: this.villageId,
      movementType: 5,
      redeployHero: false,
      units: this.units,
      // {
      //   1: 0,
      //   2: 0,
      //   3: 0,
      //   4: 1,
      //   5: 0,
      //   6: 0,
      //   7: 0,
      //   8: 0,
      //   9: 0,
      //   10: 0,
      //   11: 0
      // },
      spyMission: "resources"
    }
  }
}

SendSupportAction.type = 3

module.exports = SendSupportAction