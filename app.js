const stack = require('./stack')
const {addRowToTable, deleteFromTable, getOneFromTable, db} = require('./db')
const Action = require('./action')
const telegram = require('./telegram')

class App {

  constructor (transport) {
    this.transport = transport || {broadcast: _ => _}
    this.intervals = {}
    this.schemas = {}
    this.initialData = {}
  }

  init() {
    db.all(`PRAGMA table_info(users)`, [], (err, rows) => err ? telegram.alert(err) : this.schemas.user = rows)
    db.all(
      `SELECT * FROM users
      LEFT JOIN villages USING (userId)
      LEFT JOIN actions USING (userId)`,
      [],
      (err, rows) => {
        err ? telegram.alert(err) : this.initialData.users = rows
        this.initActions(rows)
      }
    )
  }

  initActions(actions) {
    actions.map(actionData => {
      if (!actionData.period) {
        return
      }
      const action = new Action(actionData, [this.transport.broadcast])
      stack.push(action)
      setInterval(() => stack.push(action), action.period * 1000)
    })
  }

  async addUser(data) {
    const user = await addRowToTable('users', data)
    const {id} = await addRowToTable('actions', {userId: user.id, period: 60})
    const actionData = {
      ...user,
      ...(await getOneFromTable('actions', {actionId: id}))
    }
    const action = new Action(actionData)
    stack.push(action)
    setInterval(() => stack.push(action), action.period * 1000)
    return user
  }

  deleteUser({id}) {
    deleteFromTable('users', {id})
    deleteFromTable('villages', {userId: id})
    deleteFromTable('actions', {userId: id})
  }

  addAction(data) {
    return addRowToTable('actions', data)
  }
}

module.exports = App