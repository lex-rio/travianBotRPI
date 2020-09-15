"use strict";

const http = require('http')
const fs = require('fs')
const WebSocket = require('ws')
const App = require('./app')
const telegram = require('./telegram')

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

const app = new App({
  transport: {
    broadcast: data => wss.clients.forEach(client => client.send(JSON.stringify({action: 'updateUser', dataset: data})))
  },
  telegram
})
app.init()

wss.on('connection', async ws => {
  ws.send(JSON.stringify({action: 'init', dataset: {initialData: app.initialData, schemas: app.schemas}}))

  app.runningActions.map(action => ws.send(JSON.stringify({action: 'updateUser', dataset: action.lastResponse})))

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