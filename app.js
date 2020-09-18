"use strict"

const {add, remove, getOne, update} = require('./db')
const actionFactory = require('./actions/factory')

class App {

  constructor ({transport, logger, db}) {
    this.runningActions = []
    this.logger = logger
    this.transport = transport || {broadcast: _ => _}
    this.schemas = {}
    this.initialData = {}
    this.db = db
    this.db.all(`PRAGMA table_info(users)`, [], (err, rows) => err ? this.logger.alert(err) : this.schemas.user = rows)
    this.db.all(`SELECT * FROM users`, [], (err, rows) => err ? this.logger.alert(err) : this.initialData.users = rows)
    this.db.all(
      `SELECT * from actions LEFT JOIN villages USING (userId) LEFT JOIN users USING (userId)`,
      [],
      (err, rows) => err ? this.logger.alert(err) : this.initActions(rows)
    )
  }

  initActions(actions = []) {
    actions.map(actionData => {
      this.runningActions.push(
        actionFactory(actionData, {success: this.transport.broadcast, error: this.logger.alert})
      )
    })
  }

  async addUser(data) {
    const [user] = await add('users', [data])
    const actions = await add('actions', [
      {userId: user.userId, period: 60},
      {userId: user.userId, period: 120, type: 1}
    ])
    this.initActions(actions.map(action => ({...action, ...user})))
    return user
  }

  updateUser (data) {
    return update('user', {userId: data.userId}, data)
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