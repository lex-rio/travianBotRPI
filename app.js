const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite', console.error)
const stack = require('./stack')
const {addRowToTable, deleteFromTable, getOneFromTable} = require('./db')
const Action = require('./action')
const telegram = require('./telegram')

class App {

  constructor () {
    this.intervals = {}
  }

  init() {
    db.all(`PRAGMA table_info(users)`, [], (err, rows) => err ? reject(err) : this.userSchema = rows)
  }

  initContext() {
    return new Promise((resolve, reject) => {
      db.all(`SELECT * FROM users`, [], (err, rows) => err ? reject(err) : resolve({userSchema: this.userSchema, users: rows}))
    })
  }

  async addUser(data) {
    const user = await addRowToTable('users', data)
    const {id} = await addRowToTable('actions', {userId: user.id, period: 60})
    const actionData = await getOneFromTable('actions', {id})
    const action = new Action(actionData, {callback: (d) => telegram.log('-486239249', d)})
    stack.push(action)
    setInterval(() => stack.push(action), action.period * 1000)
    return user
  }

  deleteUser(cond) {
    return deleteFromTable('users', cond)
  }

  addAction(data) {
    return addRowToTable('actions', data)
  }
}

module.exports = App