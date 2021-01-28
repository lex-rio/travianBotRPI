"use strict"

const { add, remove, getOne, update } = require('./db')
const { actionFactory, types } = require('./actions/factory')
const { User } = require('./entities/user')

class App {

  constructor ({transport, logger, db}) {
    this.runningActions = []
    this.logger = logger
    this.transport = transport || {broadcast: _ => _}
    this.types = types
    this.initialData = {}
    this.db = db
    this.db.all(
      `SELECT * from users 
      LEFT JOIN actions USING (userId)`,
      [],
      (err, rows) => {
        if (err) return this.logger.alert(err)
        const users = rows.reduce((acc, action) => {
          const index = acc.findIndex(u => u.userId === action.userId)
          const user = index !== -1 ? acc[index] : new User(action)
          user.actions.push(action)
          if (index === -1) {
            acc.push(user)
          }
          return acc
        }, [])
        this.initialData.users = users
        this.initActions(rows)
      }
    )
  }

  initActions(actions = []) {
    actions.map(actionData => {
      this.runningActions.push(
        actionFactory(actionData, {
          success: this.transport.broadcast,
          error: this.logger.alert
        })
      )
    })
  }

  async addUser(data) {
    const [user] = await add('users', [data])
    const actions = await add('actions', [
      {userId: user.userId, period: 60},
      {userId: user.userId, period: 120, type: 1}
    ])
    this.initialData.users.push(user)
    this.initActions(actions.map(action => ({...action, ...user})))
    return user
  }

  updateUser (data) {
    // add('actions', [
    //   {userId: data.userId, period: 120, type: 8}
    // ])
    return update('users', {userId: data.userId}, data)
  }

  async deleteUser(cond) {
    if (!cond) return
    this.initialData.users = this.initialData.users.filter(({userId}) => userId !== cond.userId)
    this.runningActions = this.runningActions.filter(action => {
      if (action.userId === cond.userId) {
        action.stop()
      }
      return action.userId !== cond.userId
    })
    await Promise.all([
      remove('users', cond),
      remove('villages', cond),
      remove('actions', cond),
    ])
    return cond
  }

  async addAction(data) {
    const {id} = await addRowsToTable('actions', [data])
    this.initActions([{...(await getOne('actions', {actionId: id}))}])
    return id
  }
}

module.exports = App