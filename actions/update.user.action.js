"use strict";

const Action = require('./action')
const FinishBuildingAction = require('./finish.building.action')

const attackMovementTypes = {3: 'Attack', 4: 'Raid'}

const notified = []

const period5min = 300000

const notifyAttack = (data, villageId, name, notifyCallback = () => { }) => {
  try {
    if (
      data.movement &&
      !notified.includes(data.troopId) &&
      attackMovementTypes[+data.movement.movementType] &&
      data.movement.villageIdTarget == villageId &&
      !Object.values(data.units).some(unit => unit > -1)
    ) {
      const time = new Date(data.movement.timeFinish * 1000).toLocaleTimeString(undefined, { hour12: false })
      notifyCallback(`${attackMovementTypes[+data.movement.movementType]} to ${name} from ${data.playerName}(${data.villageName}) at ${time}`)
      notified.push(data.troopId)
    }
  } catch (e) {
    notifyCallback(e.message)
  }
}

class UpdateUserAction extends Action {

  constructor(actionData, callbacks) {
    actionData.period = actionData.period || 360
    super(actionData, callbacks)

    this.actionName = 'updateUserData'
    this.controller = 'cache'
    this.action = 'get'
    // this.villagesNames = this.setVillageIds(actionData.villages)
  }

  setVillageIds(villages = []) {
    const names = []
    villages.forEach(villageId => {
      names.push(`Collection:Troops:moving:${villageId}`)
      names.push(`Collection:Troops:stationary:${villageId}`)
      names.push(`BuildingQueue:${villageId}`)
      names.push(`Collection:Building:${villageId}`)
      names.push(`Collection:Building:${villageId}`)
      
    })
    return names
  }

  params() {
    return {
      names: [
        `Player:${this.userId}`,
        `Hero:${this.userId}`,
        'Collection:Village:own',
        'Collection:FarmList:',
        'Collection:Notifications:',
        //"Collection:ChatRoom:",
        ...this.villagesNames
      ]
    }
  }

  init(user) {
    this.villagesNames = this.setVillageIds(user.villages)
    super.init(user)
  }

  getData({ cache }) {
    const { data: user } = cache.find(({ name }) => name.indexOf('Player:') === 0)
    this.userId = user.playerId
    const troopsMoving = {}
    const troopsStationary = {}
    const villagesBuildingQueue = {}
    const buildings = {}
    cache.map(({ name, data }) => {
      if (name === 'Collection:FarmList:') {
        user.farmLists = data.cache.map(({data}) => data)
      } else if (name.includes('Hero:')) {
        user.hero = data
      } else if (name.includes('Collection:Notifications:')) {
        user.notifications = data.cache
      } else if (name.includes('Collection:Troops:moving')) {
        troopsMoving[name.split(':')[3]] = data.cache
        data.cache.map(({ data }) => notifyAttack(data, name.split(':')[3], user.name, this.errorCallback))
      } else if (name.includes('Collection:Troops:stationary')) {
        troopsStationary[name.split(':')[3]] = data.cache
      } else if (name.includes('BuildingQueue:')) {
        this.finishBuildings([data.queues[1], data.queues[2]], this.session)
        villagesBuildingQueue[name.split(':')[1]] = data
      } else if (name.includes('Collection:Building:')) {
        buildings[name.split(':')[2]] = data.cache
      }
    })
    for (const i in user.villages) {
      user.villages[i].buildingQueue = villagesBuildingQueue[user.villages[i].villageId]
      user.villages[i].troopsMoving = troopsMoving[user.villages[i].villageId]
      user.villages[i].troopsStationary = troopsStationary[user.villages[i].villageId]
      user.villages[i].buildings = buildings[user.villages[i].villageId]
    }

    return user
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
// "Collection:FarmList:"
UpdateUserAction.type = 0

module.exports = UpdateUserAction