"use strict";

const Action = require('./action')

class SendSupportAction extends Action {

  constructor(data, callbacks) {
    super(data, callbacks)
    // this.actionName = 'startFarmListRaid'
    // this.controller = 'troops'
    // this.action = 'startFarmListRaid'
  }

  params() {
    return {
      listIds: [857],
      villageId: 536068116
    }
  }
}

SendSupportAction.type = 3

module.exports = SendSupportAction