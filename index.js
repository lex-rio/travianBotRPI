"use strict";

const http = require('http')
const fs = require('fs')
const WebSocket = require('ws')
const App = require('./app')
const telegram = require('./telegram')
const { db } = require('./db')
const { router } = require('./api')

// serve static
const staticFilesBinnary = fs.readdirSync('./public')
  .reduce((filesObject, file) => {
    filesObject[file] = fs.readFileSync(`./public/${file}`, 'utf8')
    return filesObject
  }, {})

const server = http.createServer((request, response) => {
  const uri = request.url.substring(1) || 'index.html'
  if (staticFilesBinnary[uri]) {
    response.writeHead(200)
    return response.end(staticFilesBinnary[uri])
  }
  if (router[uri]) {
    const result = router[uri]()
    response.writeHead(200)
    return response.end(JSON.stringify(result))
  }
  response.writeHead(404)
  return response.end()
}).listen(process.env.PORT, () => console.log(`listen http port ${process.env.PORT}`))

const wss = new WebSocket.Server({
  port: process.env.WS_PORT,
  httpServer: server,
  autoAcceptConnections: false
})

const app = new App({
  transport: {
    broadcast: action => wss.clients.forEach(client => client.send(JSON.stringify(action)))
  },
  logger: telegram,
  db
})

wss.on('connection', async ws => {

  ws.send(JSON.stringify({ actionName: 'init', ...app.getInitialData() }))
  app.initialData.users
    .forEach(user => user.actions
      .forEach(action => ws.send(JSON.stringify(action))))

  ws.on('message', async message => {
    const { action, data } = JSON.parse(message)
    if (typeof app[action] !== 'function') {
      return ws.send((`invalid request ${action}`))
    }
    try {
      const dataset = await app[action](data)
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ actionName: action, ...dataset }))
        }
      })
    } catch (e) {
      console.error(e)
    }
  })
  ws.on('close', message => console.log('man leaved'))
})