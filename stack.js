"use strict";

const tick = 1000
const stack = []

setInterval(async () => {
  console.log({stack: stack.length})
  let action
  while (action = stack.pop()) {
    if (action.run && action.callbacks && action.getData) {
      const response = await action.run()
      try {
        action.callbacks.map(
          callback => callback(action.getData(response))
        )
      } catch (e) {
        action.errorCallback({error: e, response})
      }
    }
  }
},tick)

module.exports = stack