"use strict"

const { add, remove, getOne, update } = require('./db')
const { actionFactory } = require('./actions/factory')
const { User } = require('./entities/user')

class App {

  constructor({ transport, logger, db }) {
    this.logger = logger
    this.transport = transport || { broadcast: _ => _ }
    this.callbacks = {
      success: this.transport.broadcast,
      error: this.logger.alert
    }
    this.initialData = {
      users: new Map()
    }
    this.db = db
    this.init()
  }

  init() {
    this.db.all(
      `SELECT * from users LEFT JOIN actions USING (userId)`, [],
      (err, rows) => {
        if (err) return this.logger.alert(err)
        rows.forEach(action => {
          let user = this.initialData.users.get(action.userId)
          if (!user) {
            user = new User(action)
            this.initialData.users.set(action.userId, user)
          }
          user.actions.push(actionFactory(action, this.callbacks))
        })
      }
    )
  }

  getInitialData() {
    return {
      users: [...this.initialData.users.values()]
    }
  }

  /**
   * @todo: refactoring
   * @param {UserData} data 
   */
  async addUser(data) {
    const [userData] = await add('users', [data])
    const actions = await add('actions', [{ userId: userData.userId }])
    const user = new User(userData)
    user.actions = actions.map(action => actionFactory({ ...action, ...user }, this.callbacks))
    this.initialData.users.set(user.userId, user)

    return user
  }

  async updateUser(data) {
    const user = this.initialData.users.get(+data.userId)
    if (user) {
      update('users', { userId: data.userId }, data)
      user.setProperties(data)
    }
    return user
  }

  async updateHeroProduction({ userId, resourceId }) {
    const user = this.initialData.users.get(userId)
    if (user)
      user.updateHeroProduction(resourceId)
  }

  async triggerAction({ actionId, userId }) {
    const user = this.initialData.users.get(+userId)
    if (user)
      user.triggerAction(actionId)
  }

  async deleteUser(cond) {
    if (!cond) return
    const user = this.initialData.users.get(cond.userId)
    if (user) {
      user.stopActions()
      this.initialData.users.delete(cond.userId)
    }
    await Promise.all([
      remove('users', cond),
      remove('villages', cond),
      remove('actions', cond),
    ])
    return cond
  }

  async addAction(data) {
    const { id } = await addRowsToTable('actions', [data])
    this.initActions([{ ...(await getOne('actions', { actionId: id })) }])
    return id
  }

  async startAdventure({ userId }) {
    const user = this.initialData.users.get(userId)
    if (user)
      user.startAdventure()
  }

  async toggleAction({paused, userId, actionId}) {
    const user = this.initialData.users.get(userId)
    if (user)
      return user.toggleAction(paused, actionId)
  }

  async sendSupport(data) {
    console.log(data)
  }
}

module.exports = App
