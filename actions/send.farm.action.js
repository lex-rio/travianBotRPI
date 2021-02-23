"use strict";

const Action = require('./action')

class SendFarmAction extends Action {

  constructor(data, callbacks) {
    super(data, callbacks)
    this.period = data.period || 600
    this.actionName = 'startFarmListRaid'
    this.controller = 'troops'
    this.action = 'startFarmListRaid'
    this.paramsData = JSON.parse(data.params)
  }

  params() {
    return this.paramsData
  }
}

SendFarmAction.type = 2

module.exports = SendFarmAction