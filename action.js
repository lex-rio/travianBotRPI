"use strict";

const fetch = require('./fetch')
const telegram = require('./telegram')

const actionTypes = [
  {
    typeName: 'playerInfo',
    controller: 'cache',
    action: 'get',
    params: userId => ({names: [`Player:${userId}`]}),
    getData: data => data.cache[0].data.villages.map(({villageId, name, storage}) => ({villageId, name, storage, storageCapacity}))
  }
]

class Action {
  constructor({session, type, userId, period, time, priority}, {callback}) {
    this.session = session
    this.time = time
    this.userId = userId
    this.priority = priority
    this.period = period
    this.controller = actionTypes[type].controller
    this.action = actionTypes[type].action
    this.params = actionTypes[type].params
    this.getData = actionTypes[type].getData
    this.callback = callback
    this.errorCallback = error => telegram.log('-486239249', {error})
  }

  run () {
    return fetch(
      {
        hostname: process.env.KINGDOMS_HOST,
        port: 443,
        path: `/api/?c=${this.controller}&a=${this.action}`,
        method: 'POST',
        headers: {'Content-Type': 'application/json'}
      },
      {
        controller: this.controller,
        action: this.action,
        params: this.params,//{names: ["Player:853"]},
        session: this.session//"6c7c1b981cee778cad62"
      }
    )
  }
}

module.exports = Action