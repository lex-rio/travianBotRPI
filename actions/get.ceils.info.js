"use strict";

const Action = require('./action')

class GetCeilsInfo extends Action {

  constructor(data, callbacks = {}) {
    super(data, callbacks)
    
    this.actionName = 'getCeilsInfo'
    this.controller = 'cache'
    this.action = 'get'
  }

  params() {
    return {
      names: this.ceils
    }
  }

  setCeils(ceilsIds) {
    this.ceils = ceilsIds.map(ceilId => `MapDetails:${ceilId}`)
      .concat(ceilsIds.map(ceilId => `Village:${ceilId}`))
  }

  getData(data) {
    return data.cache
  }
}

GetCeilsInfo.type = 13

module.exports = GetCeilsInfo