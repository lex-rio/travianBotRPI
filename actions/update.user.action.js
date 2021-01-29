"use strict";

const Action = require('./action')

const baseRequestNames = (userId) => [
  `Player:${userId}`,
  `Hero:${userId}`
]

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
      ...baseRequestNames(userId),
      ...this.villagesIds.map(id => `BuildingQueue:${id}`)
    ]})
    this.getData = data => {
      const userData = data.cache[0].data
      for (const i in userData.villages) {
        userData.villages[i].buildingQueue = this.villagesBuildingQueue[userData.villages[i].villageId]
      }
      userData.hero = data.cache[1].data
      return userData
    }
  }

  callback (response) {
    this.villagesIds = response.cache[0].data.villages.map(({villageId}) => villageId)
    const baseRequestNamesLength = baseRequestNames().length

    if (response.cache.length == baseRequestNamesLength)
      return

    for (const {data} of response.cache.slice(baseRequestNamesLength)) {
      this.villagesBuildingQueue[data.villageId] = data
    }
  }
}

module.exports = UpdateUserAction