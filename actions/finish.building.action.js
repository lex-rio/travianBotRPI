"use strict";

const Action = require('./action')

class FinishBuildingAction extends Action {

  constructor(data, callbacks) {
    super(data, callbacks)
    this.villageId = data.villageId
    this.queueType = data.queueType
    this.actionName = 'bookFeature'
    this.controller = 'premiumFeature'
    this.action = 'bookFeature'
  }

  params() {
    return {
      featureName: "finishNow",
      params: {
        villageId: data.villageId,
        queueType: data.queueType,
        price: 0
      }
    }
  }
}

FinishBuildingAction.type = 11

module.exports = FinishBuildingAction

// a = {
//   "controller": "premiumFeature",
//   "action": "bookFeature",
//   "params": {
//     "featureName": "finishNow",
//     "params": {
//       "villageId": 535937028,
//       "queueType": "2", "price": 0
//     }
//   },
//   "session": "2296c32452ae5b7374cb"
// }