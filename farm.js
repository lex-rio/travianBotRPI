"use strict"

const telegram = require('./telegram')
const fetch = require('./fetch')
const playersFarmLists = require('./farmLists.json')

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
  fetch('/api/?c=troops&a=startPartialFarmListRaid', postData).then(data => {
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
      () => {
        serTimeout(() => {
          sendFarm({village, player})
        }, Math.floor(Math.random() * Math.floor(100)))
      },
      village.period * 60000
    )
  })
})
