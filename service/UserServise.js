const { User } = require('./../entities/user')
const { actionFactory, classes: { UpdateUserAction } } = require('./../actions/factory')
const { add, remove, getOne, update } = require('./../db')

class UserService {

  constructor({ db, callbacks }) {
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
          rows.forEach(async row => {
            let user = users.get(row.userId)
            if (!user) {
              user = new User(row)
              await user.init()
              users.set(user.userId, user)
            }
            if (row.actionId) {
              user.actions[row.actionId] = actionFactory({...row, ...user}, this.callbacks)
            }
          })
          resolve(users)
        }
      )
    })
  }

  async addUser(data) {
    const user = new User(data)
    await user.init()
    
    const [userData] = await add('users', [user.export()])
    const [action] = await add('actions', [{ userId: user.userId, type: UpdateUserAction.type }])

    const updateUserAction = new UpdateUserAction({
      ...action,
      ...userData,
      villages: user.villages
    }, this.callbacks)

    user.actions[updateUserAction.actionId] = updateUserAction
    
    return user
  }

  updateUser(data) {
    return update('users', { userId: data.userId }, data)
  }

  deleteUser(cond) {
    return Promise.all([
      remove('users', cond),
      remove('actions', cond),
    ])
  }

  async addAction(user, type, params) {
    const [action] = await add('actions', [{ userId: user.userId, type, params: JSON.stringify(params) }])
    user.actions[action.actionId] = actionFactory({...action, ...user}, this.callbacks)
    return user
  }
}

module.exports = { UserService }