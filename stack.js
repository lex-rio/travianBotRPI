"use strict";

const tick = 1000
const stack = new Map()

setInterval(() => {
  const now = Math.trunc((new Date()).getTime() / 1000)
  stack.forEach((action) => {
    action.timeLeft--
    if (action.timeLeft < 1 || action.triggerTime && now >= action.triggerTime) {
      action.run()
    }
  })
}, tick)

module.exports = stack