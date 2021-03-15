"use strict";

const GetCeilsInfo = require('./get.ceils.info.js')

const villages = {}
const peecked = {}
let initial = true

const Action = require('./action')

class GetKingdomAttacks extends Action {

  constructor(data, callbacks = {}) {
    super({...data, period: 180}, callbacks)
    this.ceilsInfoAction = new GetCeilsInfo({session: data.session}, callbacks)
    this.actionName = 'getKingdomVillageAttacks'
    this.controller = 'village'
    this.action = 'getKingdomVillageAttacks'
  }

  params() {
    return {}
  }

  async getData(data) {
    const currentTime = (new Date()).getTime()
    if (data.cache) {
      const unknownVIllages = data.cache.reduce((villagesIds, {name, data}) => {
        
        data.cache.forEach(({name}) => peecked[name] = initial ? '?' : peecked[name] || currentTime)
        
        const villageId = name.split(":").pop()
        if (!villagesIds[villageId]) {
          villagesIds.push(villageId)
        }

        return villagesIds
      }, [])
      if (unknownVIllages.length) {
        this.ceilsInfoAction.setCeils(unknownVIllages)
        const ceilsInfo = await this.ceilsInfoAction.run()
        if (ceilsInfo && ceilsInfo.length) {
          ceilsInfo.forEach(({name, data}) => {
            const villageId = name.split(':')[1]
            villages[villageId] = villages[villageId]
              ? {...villages[villageId], ...data}
              : data
          })
        }
      }
    }
    if (!this.kingdom && Object.values(villages)[0]) {
      this.kingdom = Object.values(villages)[0].kingdomTag
    }
    initial = false
    const result = {attacks: data.cache, peecked, villages, kingdom: this.kingdom}

    return result
  }
}

GetKingdomAttacks.type = 12

module.exports = GetKingdomAttacks