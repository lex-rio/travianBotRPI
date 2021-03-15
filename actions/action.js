"use strict";

const stack = require('../stack')
const fetch = require('../fetch')

class Action {

  constructor(data, callbacks = {}) {
    this.paused = true
    this.actionName = ''
    this.controller = ''
    this.action = ''
    this.lastError = ''
    this.actionId = data.actionId
    this.updatedAt = 0
    this.period = data.period
    this.triggerTime = data.triggerTime
    this.timeLeft = 0
    this.lastResponse = {}
    this.userId = data.userId
    this.setSession(data.session)
    this.time = data.time
    this.priority = data.priority
    this.setCallbacks(callbacks)
  }

  setSession(session) {
    this.session = session
  }

  setCallbacks({ success, error, broadcast }) {
    this.success = success || (() => { })
    this.broadcast = broadcast || (() => { })
    this.errorCallback = error || (() => { })
  }

  init(user) {
    this.userId = user.userId
    this.setSession(user.session)
    if (this.actionId && this.period) {
      stack.set(this.actionId, this)
      this.paused = false
    }
  }

  stop() {
    if (stack.has(this.actionId)) {
      stack.delete(this.actionId)
    }
    this.paused = true
  }

  params() {
    return {}
  }

  getData(data) {
    return data
  }

  async run() {
    try {
      const response = await fetch(`/api/?c=${this.controller}&a=${this.action}&t${+(new Date())}`, {
        controller: this.controller,
        action: this.action,
        params: this.params(),
        session: this.session
      })
      if (response.error) {
        this.lastError = response.error.message
        this.errorCallback({ error: response.error.message, response, userId: this.userId })
      } else {
        this.lastResponse = await this.getData(response)
        this.updatedAt = +(new Date())
      }
    } catch (e) {
      this.errorCallback(e.message)
    }
    if (this.period && !this.triggerTime) {
      this.timeLeft = this.period
    } else {
      this.stop()
    }
    this.success(this)
    return this.lastResponse
  }
}

module.exports = Action