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
  fetch(options, {
    "controller":"troops",
    "action":"startPartialFarmListRaid",
    "params": {
      "entryIds":[ 50069 ],
      "listId": village.listId,
      "villageId": village.id
    },
    "session": player.session
  }).then(data => {
    if (data.error) {
      throw data.error
    }
    telegram.log(player.chatId, `${player.name} ${village.name} ${encodeURIComponent(JSON.stringify(data.cache[1].data.units))}`)
  }).catch(error => {
    telegram.log(player.chatId, `${player.name} ${village.name} error ${encodeURIComponent(JSON.stringify(error))}`)
  })
}

Object.values(playersFarmLists).map(player => {
  player.villages.map(village => {
    sendFarm({village, player})
    setInterval(
      () => sendFarm({village, player}),
      village.period * 60000
    )
  })
})
