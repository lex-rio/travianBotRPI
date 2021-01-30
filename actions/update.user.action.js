"use strict";

const Action = require('./action')

class UpdateUserAction extends Action {

  constructor(actionData, callbacks) {
    super(actionData, callbacks)
    this.period = actionData.period || 60
    this.actionName = 'updateUserData'
    this.controller = 'player'
    this.action = 'getAll'
    this.params = () => ({deviceDimension: "1920:1080"})
    this.getData = data => {
      const {data: userData} = data.cache.find(({name}) => name === `Player:${actionData.userId}`)
      const troopsMoving = {}
      const villagesBuildingQueue = {}
      data.cache.map(({name, data}) => {
        if (name === `Hero:${actionData.userId}`) {
          userData.hero = data
        } else if (name.includes('Collection:Troops:moving')) {
          troopsMoving[name.split(':')[3]] = data.cache
          data.cache.map(({data}) => {
            try {
              if ([3,4].includes(+data.movement.movementType) && data.movement.villageIdTarget == name.split(':')[3]) {
                const time = new Date(data.movement.timeFinish * 1000).toLocaleTimeString(undefined, { hour12: false })
                callbacks.error(`ATTACK to user ${actionData.userId} from ${data.playerName}(${data.villageName}) at ${time}`)
              }
            } catch (e) {
              callbacks.error(e.message)
            }
          })
        } else if (name.includes('BuildingQueue:')) {
          villagesBuildingQueue[name.split(':')[1]] = data
        }
      })
      for (const i in userData.villages) {
        userData.villages[i].buildingQueue = villagesBuildingQueue[userData.villages[i].villageId]
        userData.villages[i].troopsMoving = troopsMoving[userData.villages[i].villageId]
      }
      
      return userData
    }
  }
}

module.exports = UpdateUserAction