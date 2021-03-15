const { User } = require('../entities/user')
const {
  actionFactory,
  classes: { UpdateUserAction, SendSupportAction, GetKingdomAttacks }
} = require('../actions/factory')
const { add, remove, getOne, update } = require('../db')

class UserService {

  constructor({ db, callbacks }) {
    this.db = db
    this.callbacks = callbacks
  }

  getUsers() {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT * from users LEFT JOIN actions USING (userId)`, [],
        async (err, rows) => {
          if (err) {
            reject(err)
          }
          const users = rows.reduce((users, row) => {
            let user = users.get(row.userId)
            if (!user) {
              user = new User(row)
              users.set(row.userId, user)
            }
            user.actions[row.actionId] = actionFactory({...row, ...user}, this.callbacks)
            return users
          }, new Map())
          await Promise.all(
            [...users.values()].map(user => user.init())
          )
          
          resolve(users)
        }
      )
    })
  }

  async addUser(data) {
    const user = new User(data)
    await user.init()
    
    add('users', [user.export()])
    const [action] = await add('actions', [{ userId: user.userId, type: UpdateUserAction.type }])

    const updateUserAction = new UpdateUserAction(action, this.callbacks)

    updateUserAction.init(user)

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

  sendSupport(user, data) {
    return (new SendSupportAction({...user, ...data}, this.callbacks)).run()
  }

  async addAction(user, type, params) {
    const [action] = await add('actions', [{ userId: user.userId, type, params: JSON.stringify(params) }])
    user.actions[action.actionId] = actionFactory({...action, ...user}, this.callbacks)
    return user
  }

  async addKingdomAttacksMonit(user) {
    const [action] = await add('actions', [{ userId: user.userId, type: GetKingdomAttacks.type }])
    const getKingdomAttacks = new GetKingdomAttacks({...action, ...user}, this.callbacks)
    user.actions[getKingdomAttacks.actionId] = getKingdomAttacks
    return getKingdomAttacks
  }
}

module.exports = { UserService }