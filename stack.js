"use strict";

const tick = 1000
const stack = new Map()

setInterval(() => {
  stack.forEach((action) => {
    action.timeLeft--
    if (action.timeLeft < 1) {
      action.run()
    }
  })
}, tick)

module.exports = stack