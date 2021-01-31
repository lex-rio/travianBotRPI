"use strict"

const { add, remove, getOne, update } = require('./db')
const { actionFactory, types, classes: { UpdateHeroProductionAction } } = require('./actions/factory')
const { User } = require('./entities/user')

class App {

  constructor({ transport, logger, db }) {
    this.logger = logger
    this.transport = transport || { broadcast: _ => _ }
    this.callbacks = {
      success: this.transport.broadcast,
      error: this.logger.alert
    }
    this.types = types
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
      initialData: {
        users: [...this.initialData.users.values()]
      },
      types: this.types
    }
  }

  /**
   * @todo: refactoring
   * @param {UserData} data 
   */
  async addUser(data) {
    const [user] = await add('users', [data])
    const actions = await add('actions', [
      { userId: user.userId },
      { userId: user.userId, type: 1 }
    ])
    user.actions = actions.map(action => actionFactory({ ...action, ...user }, this.callbacks))
    this.initialData.users.set(user.userId, user)

    return user
  }

  updateUser(data) {
    // add('actions', [
    //   {userId: data.userId, period: 120, type: 8}
    // ])
    return update('users', { userId: data.userId }, data)
  }

  async updateHeroProduction({ userId, resourceId }) {
    const user = await getOne('users', { userId })
    if (!user)
      return
    new UpdateHeroProductionAction({ ...user, resourceId }, this.callbacks)
  }

  async triggerAction({ actionId, userId }) {
    const user = this.initialData.users.get(+userId)
    if (!user) return
    const action = user.actions.find(action => action.actionId == actionId)
    if (action) {
      action.run()
    }
  }

  async deleteUser(cond) {
    if (!cond) return
    const user = this.initialData.users.get(cond.userId)
    user.actions.map(action => action.stop())
    this.initialData.users.delete(cond.userId)
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
}

module.exports = App