class ApiClient {

  callbacks = []

  currentUser = {
    userId: null,
    session: ''
  }

  coordinates = {x:0,y:0}

  constructor() {
    // this.ws = new WebSocket(`ws://${window.location.hostname}:8082`)
    this.ws = new WebSocket(`ws://wb2.ddns.net:8082`)
    this.ws.onmessage = ({ data }) => {
      const parsed = JSON.parse(data)
      this.callbacks.forEach(([name, cb]) => {
        if (name === parsed.actionName) {
          cb(parsed)
        }
      })
    }
  }

  send(action, data) {
    this.ws.send(JSON.stringify({ action, data }))
  }

  setCurrentUser({ session, userId }) {
    this.currentUser.userId = userId
    this.currentUser.session = session
  }

  deleteUser({ userId }) {
    this.ws.send(JSON.stringify({ action: 'deleteUser', data: { userId } }))
  }

  updateHeroProduction({ userId, resourceId }) {
    this.ws.send(JSON.stringify({ action: 'updateHeroProduction', data: { userId, resourceId } }))
  }

  registerCallbacks(callbacks) {
    Object.entries(callbacks).forEach(entry => this.callbacks.push(entry))
  }

  saveUser(data) {
    this.ws.send(JSON.stringify({ action: 'saveUser', data }))
  }
}

module.exports = ApiClient