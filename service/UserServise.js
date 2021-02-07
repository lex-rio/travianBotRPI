const { User } = require('./../entities/user')
const { actionFactory } = require('./../actions/factory')
const { add, remove, getOne, update } = require('./../db')

class UserService {

  constructor({db, callbacks}) {
    this.db = db
    this.callbacks = callbacks
  }

  getUsers() {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT * from users LEFT JOIN actions USING (userId)`, [],
        (err, rows) => {
          if (err) {
            reject(err)
          }
          const users = new Map()
          rows.forEach(action => {
            let user = users.get(action.userId)
            if (!user) {
              user = new User(action)
              users.set(action.userId, user)
            }
            user.actions.push(actionFactory(action, this.callbacks))
          })
          resolve(users)
        }
      )
    })
  }

  async addUser(data) {
    const [userData] = await add('users', [data])
    const actions = await add('actions', [{ userId: userData.userId }])
    const user = new User(userData)
    user.actions = actions.map(action => actionFactory({ ...action, ...user }, this.callbacks))
    return user
  }

  updateUser(data) {
    return update('users', { userId: data.userId }, data)
  }

  deleteUser(cond) {
    return Promise.all([
      remove('users', cond),
      remove('villages', cond),
      remove('actions', cond),
    ])
  }
}

module.exports = { UserService }