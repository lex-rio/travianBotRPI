"use strict";

const Action = require('./action')

class UpdateUserAction extends Action {

  constructor(data, callbacks) {
    super(data, callbacks)
    this.actionName = 'updateUser'
    this.controller = 'cache'
    this.action = 'get'
    this.params = userId => ({names: [`Player:${userId}`]})
    this.getData = data => data.cache[0].data
  }

  callback (data) {
    super.callback(data)
  }
}

module.exports = UpdateUserAction