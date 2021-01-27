"use strict";

const http = require('http')
const fs = require('fs')
const WebSocket = require('ws')
const App = require('./app')
const telegram = require('./telegram')
const {db} = require('./db')
const { router } = require('./api')

// serve static
const staticFilesBinnary = fs.readdirSync('./public')
  .reduce((filesObject, file) => {
    filesObject[file] = fs.readFileSync(`./public/${file}`, 'utf8')
    return filesObject
  }, {})

const server = http.createServer((request, response) => {
  const uri = request.url.substring(1) || 'index.html'
  if (!staticFilesBinnary[uri]) {
    if (router[uri]) {
      const result = router[uri]()
      response.writeHead(200)
      return response.end(JSON.stringify(result))
    }
    response.writeHead(404)
    return response.end()
  }
  response.writeHead(200)
  response.end(staticFilesBinnary[uri])
}).listen(process.env.PORT, () => console.log(`listen http port ${process.env.PORT}`))

const wss = new WebSocket.Server({
  port: process.env.WS_PORT,
  httpServer: server,
  autoAcceptConnections: false
})

const app = new App({
  transport: {
    broadcast: action =>
      wss.clients.forEach(client => {
        client.send(JSON.stringify({
          action: action.actionName,
          dataset: {...action.lastResponse, userId: action.userId, updatedAt: action.updatedAt},
          error: action.lastError
        }))
      })
  },
  logger: telegram,
  db
})

wss.on('connection', async ws => {
  ws.send(JSON.stringify({action: 'init', dataset: {initialData: app.initialData, schemas: app.schemas, types: app.types}}))

  app.runningActions.map(action => {
    ws.send(JSON.stringify({
      action: action.actionName,
      dataset: {...action.lastResponse, userId: action.userId, updatedAt: action.updatedAt},
      error: action.lastError
    }))
  })

  ws.on('message', message => {
    const {action, data} = JSON.parse(message)
    if (typeof app[action] !== 'function') {
      return ws.send((`invalid request ${action}`))
    }
    app[action](data)
      .then(dataset => wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({action, dataset}))
        }
      }))
      .catch(console.error)
  })
  ws.on('close', message => console.log('man leaved'))
})