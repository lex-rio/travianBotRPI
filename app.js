"use strict"

const { getOne } = require('./db')
const { UserService } = require('./service/UserServise')

class App {

  constructor({ transport, logger, db }) {
    this.logger = logger
    this.transport = transport || { broadcast: _ => _ }
    this.userService = new UserService({db, logger, callbacks: {
      success: this.transport.broadcast,
      error: this.logger.alert
    }})
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
    const user = this.users.get(userId)
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
    const user = this.users.get(cond.userId)
    if (user) {
      user.stopActions()
      this.users.delete(cond.userId)
      this.userService.deleteUser(cond)
    }
    return cond
  }

  async addAction(data) {
    const { id } = await addRowsToTable('actions', [data])
    this.initActions([{ ...(await getOne('actions', { actionId: id })) }])
    return id
  }

  async startAdventure({ userId }) {
    const user = this.users.get(userId)
    if (user)
      user.startAdventure()
  }

  async toggleAction({paused, userId, actionId}) {
    const user = this.users.get(userId)
    if (user)
      return user.toggleAction(paused, actionId)
  }

  async sendSupport(data) {
    console.log(data)
  }
}

module.exports = App
