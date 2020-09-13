"use strict"

const https = require("https")

const apiUrl = 'api.telegram.org/bot'
const botId = process.env.BOT_ID

module.exports = {
  log: (chatId, message) =>
    https.get(`https://${apiUrl}${botId}/sendMessage?chat_id=${chatId}&text=${typeof message === 'string' ? message : JSON.stringify(message)}`),

  alert: message =>
    https.get(`https://${apiUrl}${botId}/sendMessage?chat_id=-486239249&text=${typeof message === 'string' ? message : JSON.stringify(message)}`),

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