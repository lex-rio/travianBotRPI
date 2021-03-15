"use strict";

const http = require('http')
const fs = require('fs')
const WebSocket = require('ws')
const App = require('./app')
const telegram = require('./telegram')
const { db } = require('./db')
const { router } = require('./api')
const frontDirPath = './front/dist'

function readStatic (dir, files = {}) {
  const dirItems = fs.readdirSync(dir)
  dirItems.forEach((item) => {
    if (fs.lstatSync(`${dir}/${item}`).isDirectory()) {
      readStatic(`${dir}/${item}`, files)
    } else {
      files[`${dir.slice(frontDirPath.length)}/${item}`] = fs.readFileSync(`${dir}/${item}`, 'utf8')
    }
  })
  return files
}

// serve static
const staticFilesBinnary = readStatic(frontDirPath)

const server = http.createServer((request, response) => {
  const uri = request.url.substring(1)
  const contentTypes = {
    'css': 'text/css',
    'js': 'text/javascript'
  }
  response.setHeader('Content-Type', contentTypes[uri.split('.').pop()] || 'text/html')
  response.writeHead(200)
  return response.end(
    router[uri]
      ? JSON.stringify(router[uri]())
      : staticFilesBinnary[`/${uri}`] || staticFilesBinnary['/index.html']
  )
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
  const initialData = app.getInitialData()
  ws.send(JSON.stringify({ actionName: 'init', ...initialData }))
  initialData.users
    .forEach(user => Object.values(user.actions)
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