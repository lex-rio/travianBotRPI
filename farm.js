"use strict"

const telegram = require('./telegram')
const fetch = require('./fetch')

const options = {
  hostname: 'ru4.kingdoms.com',
  port: 443,
  path: '/api/?c=troops&a=startPartialFarmListRaid',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
}

setInterval(() => {
  fetch(options, {
    "controller":"troops",
    "action":"startPartialFarmListRaid",
    "params": {
      "entryIds":[ 50069 ],
      "listId": 1684,
      "villageId": 535379936
    },
    "session":"d87acc5e25c648fe0cac"
  }).then(data => {
    telegram.log(212565743, encodeURIComponent(JSON.stringify(data.cache[1].data.units)))
  }).catch(error => {
    telegram.log(212565743, encodeURIComponent(JSON.stringify(error)))
  })
}, 120000)