"use strict"

const telegram = require('./telegram')
const fetch = require('./fetch')

const options = {
  hostname: 'ru4.kingdoms.com',
  port: 443,
  path: '/api/?c=cache&a=get',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
}

// telegram.getMessages().then(console.log)

setInterval(() => {
  fetch(options, {
    "controller":"cache",
    "action":"get",
    "params": {
      "names":[
        "StatsWeeklyTop:853:ranking_Player"
      ]
    },
    "session":"67decd99f66c292ad818"
  }).then(data => {
    const {top10Robber} = data.cache[0].data
    const message = top10Robber.map(({playerId, name, points}) => `${playerId} \t${name}: \t${points}`).join("\n")
    telegram.log(212565743, encodeURIComponent(message))
  })
}, 5000)
