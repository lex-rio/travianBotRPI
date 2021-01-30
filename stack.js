"use strict";

const tick = 1000
const stack = new Map()

setInterval(() => {
  stack.forEach((action, key) => {
    action.timeLeft--
    if (action.timeLeft < 1) {
      action.run()
      if (action.period) {
        action.timeLeft = action.period
      } else {
        stack.delete(key)
      }
    }
    // console.log({key, timeLeft: action.timeLeft})
  })
}, tick)

module.exports = stack