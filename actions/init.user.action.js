"use strict";

const Action = require('./action')

class InitUserAction extends Action {

  constructor(actionData) {
    super(actionData)
    this.controller = 'cache'
    this.action = 'get'
  }

  params() {
    return {names: ['Collection:Village:own']}
  }

  getData({ cache }) {
    const villages = cache[0].data
    return {
      userId: +villages.cache[0].data.playerId,
      villages: villages.cache.map(({data}) => data.villageId)
    }
  }
}

module.exports = InitUserAction