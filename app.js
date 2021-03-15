"use strict"

const { getOne } = require('./db')
const { UserService, MonitorService } = require('./services')

class App {

  constructor({ transport, logger, db }) {
    this.logger = logger
    this.transport = transport || { broadcast: _ => _ }
    const callbacks = {
      success: this.transport.broadcast,
      broadcast: this.logger.broadcast,
      error: this.logger.alert
    }
    this.userService = new UserService({db, callbacks})
    this.init()
  }

  async init() {
    try {
      this.users = await this.userService.getUsers()
    } catch (e) {
      this.logger.alert(e)
    }
  }

  getInitialData() {
    return {
      users: [...this.users.values()]
    }
  }

  /**
   * @param {UserData} data 
   */
  async saveUser(data) {
    let user
    if (data.userId) {
      user = this.users.get(+data.userId)
      this.userService.updateUser(data)
      user.setProperties(data)
    } else {
      user = await this.userService.addUser(data)
      this.users.set(user.userId, user)
    }
    return user
  }

  async updateHeroProduction({ userId, resourceId }) {
    const user = this.users.get(+userId)
    if (user)
      user.updateHeroProduction(resourceId)
  }

  async triggerAction({ actionId, userId }) {
    const user = this.users.get(+userId)
    if (user)
      user.triggerAction(actionId)
  }

  deleteUser(cond) {
    if (!cond) return
    const user = this.users.get(+cond.userId)
    if (user) {
      user.stopActions()
      this.users.delete(+cond.userId)
      this.userService.deleteUser(cond)
    }
    return cond
  }

  async addAction({userId, type, params}) {
    const user = this.users.get(+userId)
    return this.userService.addAction(user, type, params)
  }

  async startAdventure({ userId }) {
    const user = this.users.get(+userId)
    if (user)
      user.startAdventure()
  }

  async toggleAction({paused, userId, actionId}) {
    const user = this.users.get(+userId)
    if (user)
      return user.toggleAction(paused, actionId)
  }

  async setUserOnWatch(userId) {
    const user = this.users.get(+userId)
    if (user)
      return this.userService.addKingdomAttacksMonit(user)
  }

  async sendSupport(data) {
    console.log(data)
    const user = this.users.get(+data.userId)
    if (user)
      return this.userService.sendSupport(user, data)
  }
}

module.exports = App
