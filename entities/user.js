const { classes: { UpdateHeroProductionAction, StartAdventureAction } } = require('./../actions/factory')
class User {
  constructor(data) {
    this.actions = []
    this.setProperties(data)
    this.villages = []
  }

  setProperties(data) {
    this.userId = data.userId
    this.session = data.session
    this.chatId = data.chatId
    this.actions.forEach(action => action.setSession(data.session))
  }

  updateHeroProduction(resourceId) {
    new UpdateHeroProductionAction({ ...this, resourceId })
  }

  startAdventure() {
    new StartAdventureAction(this)
  }
  
  triggerAction(id) {
    const action = this.findAction(id)
    if (action)
      action.run()
  }

  toggleAction(paused, id) {
    console.log({paused, id})
    const action = this.findAction(id)
    paused ? action.init() : action.stop()
    return action
  }

  stopActions() {
    this.actions.map(action => action.stop())
  }

  findAction(id) {
    return this.actions.find(({actionId}) => actionId == id)
  }
}

module.exports = { User }