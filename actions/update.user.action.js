"use strict";

const Action = require('./action')
const FinishBuildingAction = require('./finish.building.action')

const attackMovementTypes = [3, 4]

const notified = []

const period5min = 300000

const notifyAttack = (data, villageId, userId, notifyCallback = () => { }) => {
  try {
    if (
      data.movement &&
      !notified.includes(data.troopId) &&
      attackMovementTypes.includes(+data.movement.movementType) &&
      data.movement.villageIdTarget == villageId &&
      !Object.values(data.units).some(unit => unit > -1)
    ) {
      const time = new Date(data.movement.timeFinish * 1000).toLocaleTimeString(undefined, { hour12: false })
      notifyCallback(`ATTACK to user ${userId} from ${data.playerName}(${data.villageName}) at ${time}`)
      notified.push(data.troopId)
    }
  } catch (e) {
    notifyCallback(e.message)
  }
}

class UpdateUserAction extends Action {

  constructor(actionData, callbacks) {
    super(actionData, callbacks)
    this.period = actionData.period || 60
    this.actionName = 'updateUserData'
    this.controller = 'player'
    this.action = 'getAll'
  }

  params() {
    return { deviceDimension: "1920:1080" }
  }

  getData(data) {
    const { data: userData } = data.cache.find(({ name }) => name === `Player:${this.userId}`)
    const troopsMoving = {}
    const troopsStationary = {}
    const villagesBuildingQueue = {}
    const buildings = {}
    data.cache.map(({ name, data }) => {
      if (name === `Hero:${this.userId}`) {
        userData.hero = data
      } else if (name.includes('Collection:Troops:moving')) {
        troopsMoving[name.split(':')[3]] = data.cache
        data.cache.map(({ data }) => notifyAttack(data, name.split(':')[3], this.userId, this.errorCallback))
      } else if (name.includes('Collection:Troops:stationary')) {
        troopsStationary[name.split(':')[3]] = data.cache
      } else if (name.includes('BuildingQueue:')) {
        this.finishBuildings([data.queues[1], data.queues[2]], this.session)
        villagesBuildingQueue[name.split(':')[1]] = data
      } else if (name.includes('Collection:Building:')) {
        buildings[name.split(':')[2]] = data.cache
      }
    })
    for (const i in userData.villages) {
      userData.villages[i].buildingQueue = villagesBuildingQueue[userData.villages[i].villageId]
      userData.villages[i].troopsMoving = troopsMoving[userData.villages[i].villageId]
      userData.villages[i].troopsStationary = troopsStationary[userData.villages[i].villageId]
      userData.villages[i].buildings = buildings[userData.villages[i].villageId]
    }

    return userData
  }

  finishBuildings (slots) {
    slots.forEach(([slot]) => {
      if (slot && slot.finished * 1000 - (new Date()) < period5min) {
        new FinishBuildingAction({
          villageId: slot.villageId,
          queueType: slot.queueType,
          session: this.session,
          userId: this.userId
        }) 
      }
    });
  }
}

UpdateUserAction.type = 0

module.exports = UpdateUserAction