"use strict"

const https = require("https")

const apiUrl = 'api.telegram.org/bot'
const botId = process.env.BOT_ID

module.exports = {
  log: (chatId, message) => {
    const m = typeof message === 'string' ? message : JSON.stringify(message)
    https.get(`https://${apiUrl}${botId}/sendMessage?chat_id=${chatId}&text=messagefrom-${process.env.ENVIRONMENT} ${m}`)
  },

  alert: message => {
    const m = typeof message === 'string' ? message : JSON.stringify(message)
    https.get(`https://${apiUrl}${botId}/sendMessage?chat_id=-486239249&text=alertfrom-${process.env.ENVIRONMENT} ${m}`)
  },

  broadcast: message => {
    console.log({message})
    const m = typeof message === 'string' ? message : JSON.stringify(message)
    console.log({m})
    https.get(`https://${apiUrl}${botId}/sendMessage?chat_id=-554455171&text=${m}`)
  },

  getMessages: () =>
    new Promise((resolve, reject) => {
      const req = https.request(`https://${apiUrl}${botId}/getUpdates`, resp => {
        let data = ''
        resp.on('data', chunk => (data += chunk))
        resp.on('end', () => {
          const parsed = JSON.parse(data)
          resolve(parsed.result)
        })
      })
      req.on("error", reject)
      req.end()
    })
}