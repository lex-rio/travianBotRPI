"use strict";

const stack = require('../stack')
const fetch = require('../fetch')

class Action {

  constructor({session, userId, period, time, priority}, {success, error}) {
    this.updatedAt = 0 
    this.lastResponse = {}
    this.userId = userId
    this.session = session
    this.time = time
    this.priority = priority
    this.period = period
    this.success = success
    this.error = error

    this.actionName = ''
    this.controller = ''
    this.action = ''
    this.params = userId => ({names: [`Player:${userId}`]})
    this.getData = data => data

    this.init()
  }

  init () {
    if (this.period) {
      stack.push(this)
      this.intervalId = setInterval(() => stack.push(this), this.period * 1000)
    }
  }

  stop () {
    console.log(`action for user ${this.userId} was stopped`)
    clearInterval(this.intervalId)
  }

  async run () {
    let response
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
      this.error({error: e, response, userId: this.userId})
    }
    this.success(this)
  }
}

module.exports = Action