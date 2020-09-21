"use strict";

const tick = 1000
const stack = []

setInterval(() => {
  console.log({stack: stack.length})
  let action
  while (action = stack.pop()) {
    action.run()
  }
},tick)

module.exports = stack