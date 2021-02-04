"use strict";

const stack = require('../stack')
const fetch = require('../fetch')

class Action {

  constructor(data, callbacks = {}) {
    this.paused = false
    this.actionName = ''
    this.controller = ''
    this.action = ''
    this.actionId = data.actionId
    this.updatedAt = 0 
    this.timeLeft = 0
    this.lastResponse = {}
    this.userId = data.userId
    this.session = data.session
    this.time = data.time
    this.priority = data.priority
    this.period = data.period
    this.success = callbacks.success || (() => {})
    this.errorCallback = callbacks.error || (() => {})

    this.init()
  }

  init () {    
    stack.set(this.actionId, this)
    this.paused = false
  }

  stop () {
    if (stack.has(this.actionId)) {
      stack.delete(this.actionId)
    }
    this.paused = true
  }

  params(userId) {
    return {names: [`Player:${userId}`]}
  }

  getData(data) {
    return data
  }

  async run () {
    let response
    this.lastError = ''
    try {
      response = await fetch(`/api/?c=${this.controller}&a=${this.action}&t${+(new Date())}`, {
        controller: this.controller,
        action: this.action,
        params: this.params(this.userId),
        session: this.session
      })
      if (response.error) {
        throw new Error(response.error.message)
      }
      this.lastResponse = this.getData(response)
      this.updatedAt = +(new Date())
    } catch (e) {
      this.lastError = e.message
      this.errorCallback({error: e, response, userId: this.userId})
    }
    if (this.period) {
      this.timeLeft = this.period
    } else {
      stack.delete(this.actionId)
    }
    this.success(this)
  }
}

module.exports = Action