"use strict";

const Action = require('./action')

class SendFarmAction extends Action {

  constructor(data, callbacks) {
    super(data, callbacks)
    this.period = data.period || 300
    this.actionName = 'startFarmListRaid'
    this.controller = 'troops'
    this.action = 'startFarmListRaid'
  }

  params() {
    return {
      listIds: [53],
      villageId: 536068116
    }
  }
}


module.exports = SendFarmAction