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

const sendFarm = ({village, player}) => {
  const postData = {
    "controller":"troops",
    "action":"startFarmListRaid",
    "params": {
      "listIds": [village.listId],
      "villageId": village.id
    },
    "session": player.session
  }
  fetch(options, postData).then(data => {
    if (data.error || !data.cache) {
      throw data.error || 'empty response'
    }
    telegram.log(player.chatId, `${player.name} ${village.name} ${encodeURIComponent(JSON.stringify(data.cache[1].data.units))}`)
  }).catch(error => {
    telegram.log(player.chatId, `${player.name} ${village.name} error ${encodeURIComponent(JSON.stringify(error))}`)
  })
}

playersFarmLists.map(player => {
  player.villages.map(village => {
    sendFarm({village, player})
    setInterval(
      () => sendFarm({village, player}),
      village.period * 60000
    )
  })
})
