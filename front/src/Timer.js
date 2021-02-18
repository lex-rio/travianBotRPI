class Timer {
  callbacks = []

  constructor() {
    setInterval(() => this.callbacks.map(callback => callback()), 1000)
  }

  subscribe(callback) {
    this.callbacks.push(callback)
  }
}

module.exports = Timer