"use strict";

const Action = require('./action')

class UpdateUserAction extends Action {

  constructor(data, callbacks) {
    super(data, callbacks)
    this.period = data.period || 60
    this.villagesIds = []
    this.villagesBuildingQueue = {}
    this.actionName = 'updateUserData'
    this.controller = 'cache'
    this.action = 'get'
    this.params = userId => ({names: [
      `Player:${userId}`,
      ...this.villagesIds.map(id => `BuildingQueue:${id}`)
    ]})
    this.getData = data => {
      const userData = data.cache[0].data
      for (const i in userData.villages) {
        userData.villages[i].buildingQueue = this.villagesBuildingQueue[userData.villages[i].villageId]
      }
      return userData
    }
  }

  callback (response) {
    this.villagesIds = response.cache[0].data.villages.map(({villageId}) => villageId)

    if (response.cache.length < 2)
      return

    for (const {data} of response.cache.slice(1)) {
      this.villagesBuildingQueue[data.villageId] = data
    }
  }
}

module.exports = UpdateUserAction