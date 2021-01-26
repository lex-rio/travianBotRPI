"use strict";

const Action = require('./action')

class GetLastReportsAction extends Action {
  constructor(data, callbacks = []) {
    callbacks.success = (action) => {
      console.log(action.lastResponse)
    }
    super(data, callbacks)

    this.actionName = 'getLastReports'
    this.controller = 'reports'
    this.action = 'getLastReports'
    this.params = () => ({collection: "own", start: 0, count: 10, filters: ["3"], alsoGetTotalNumber: true})
    this.getData = data => data.response.reports
  }
}

module.exports = GetLastReportsAction