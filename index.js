"use strict";

const http = require('http')
const fs = require('fs')
const WebSocket = require('ws')
const App = require('./app')

// serve static
const staticFilesBinnary = fs.readdirSync('./public')
  .reduce((filesObject, file) => {
    filesObject[file] = fs.readFileSync(`./public/${file}`, 'utf8')
    return filesObject
  }, {})

const server = http.createServer((request, response) => {
  const file = request.url.substring(1) || 'index.html'
  if (!staticFilesBinnary[file]) {
    response.writeHead(404)
    return response.end()
  }
  response.writeHead(200)
  response.end(staticFilesBinnary[file])
}).listen(process.env.PORT, () => console.log(`listen http port ${process.env.PORT}`))

const wss = new WebSocket.Server({
  port: process.env.WS_PORT,
  httpServer: server,
  autoAcceptConnections: false
})

const app = new App()
app.init()

wss.on('connection', async ws => {
  app.initContext()
    .then(dataset => ws.send(JSON.stringify({action: 'init', dataset})))
    .catch(console.error)

  ws.on('message', message => {
    const {action, data} = JSON.parse(message)
    if (typeof app[action] !== 'function') {
      return ws.send((`invalid request ${action}`))
    }
    app[action](data)
      .then(data => wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({action, data}))
        }
      }))
      .catch(console.error)
  })
  ws.on('close', message => console.log('man leaved'))
})

// const options = {
//   hostname: 'ru4.kingdoms.com',
//   port: 443,
//   path: '/api/?c=ranking&a=getKingdomVictoryPointsWithTreasures',
//   method: 'POST',
//   headers: {
//     'Content-Type': 'application/json'
//   }
// }

// // const postData = {controller:"ranking",action:"getKingdomVictoryPointsWithTreasures",params:{start:0, end: 20},session:"6c7c1b981cee778cad62"}

// const postData = {
//   controller: "cache",
//   action: "get",
//   params: {
//     names: ["Player:853"]
//   },
//   "session":"6c7c1b981cee778cad62"
// }


// setInterval(() => {
//   stack.push({
//     time: '',
//     priority: 0,
//     getData: data => data.cache[0].data.villages.map(({villageId, name, storage, storageCapacity}) => ({villageId, name, storage, storageCapacity})),
//     // getData: data => data.response.results,
//     run: () => fetch(options, postData)
//   })
// }, 5000)
