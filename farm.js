"use strict"

const telegram = require('./telegram')
const fetch = require('./fetch')
const playersFarmLists = require('./farmLists.json')

const options = {
  hostname: 'ru4.kingdoms.com',
  port: 443,
  path: '/api/?c=troops&a=startPartialFarmListRaid',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
}

Object.values(playersFarmLists).map(({villages, chatId, name, session}) => {
  villages.map(village => {
    setInterval(() => {
      fetch(options, {
        "controller":"troops",
        "action":"startPartialFarmListRaid",
        "params": {
          "entryIds":[ 50069 ],
          "listId": village.listId,
          "villageId": village.villageId
        },
        "session": session
      }).then(data => {
        telegram.log(chatId, name + encodeURIComponent(JSON.stringify(data.cache[1].data.units)))
      }).catch(error => {
        telegram.log(chatId, name + encodeURIComponent(JSON.stringify(error)))
      })
    }, village.period * 60000)
  })
})
