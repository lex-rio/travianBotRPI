"use strict";

const Action = require('./action')

class GetLastReportsAction extends Action {

  constructor(data, callbacks = []) {
    super(data, callbacks)
    this.actionName = 'getLastReports'
    this.controller = 'reports'
    this.action = 'getLastReports'
  }

  params(userId) {
    return {
      collection: "own",
      start: 0,
      count: 10,
      filters: ["3"],
      alsoGetTotalNumber: true
    }
  }

  getData(data) {
    return data.response.reports
  }
}

GetLastReportsAction.type = 8

module.exports = GetLastReportsAction