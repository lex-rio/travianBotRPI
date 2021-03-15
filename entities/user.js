const { classes: { UpdateHeroProductionAction, StartAdventureAction, InitUserAction } } = require('./../actions/factory')
class User {
  constructor(data) {
    this.actions = data.actions || {}
    this.setProperties(data)
  }

  setProperties(data) {
    this.userId = data.userId
    this.session = data.session
    this.chatId = data.chatId
    Object.values(this.actions).forEach(action => action.setSession(data.session))
  }

  async init() {
    const initUserAction = new InitUserAction({session: this.session})
    const { userId, villages } = await initUserAction.run()
    this.userId = userId
    this.villages = villages
    this.initActions()
    return this
  }

  export() {
    return {
      session: this.session,
      chatId: this.chatId,
      userId: this.userId
    }
  }

  updateHeroProduction(resourceId) {
    (new UpdateHeroProductionAction({ ...this, resourceId }))
      .run()
  }

  startAdventure() {
    (new StartAdventureAction(this)).run()
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

  initActions() {
    Object.values(this.actions).forEach(action => action.init(this))
  }

  stopActions() {
    Object.values(this.actions).map(action => action.stop())
  }

  findAction(id) {
    return Object.values(this.actions).find(({actionId}) => actionId == id)
  }
}

module.exports = { User }