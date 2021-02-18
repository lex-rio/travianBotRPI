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
          rows.forEach(row => {
            let user = users.get(row.userId)
            if (!user) {
              user = new User(row)
              users.set(row.userId, user)
            }
            if (row.actionId) {
              user.actions[row.actionId] = actionFactory(row, this.callbacks)
            }
          })
          resolve(users)
        }
      )
    })
  }

  async addUser(data) {
    const updateUserAction = new UpdateUserAction(data)
    const player = await updateUserAction.run()
    
    const [userData] = await add('users', [{ ...data, userId: player.playerId }])
    const [action] = await add('actions', [{ userId: userData.userId, type: UpdateUserAction.type }])
    
    updateUserAction.actionId = action.actionId
    updateUserAction.setCallbacks(this.callbacks)
    updateUserAction.init()

    const actions = {}
    actions[updateUserAction.actionId] = updateUserAction
    
    return new User({...data, ...userData, actions})
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
}

module.exports = { UserService }