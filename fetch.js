"use strict"

const https = require("https")

module.exports = (uri, postData) => {
  const options = {
    hostname: process.env.KINGDOMS_HOST,
    port: 443,
    path: uri,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  }
  return new Promise((resolve, reject) => {
    const req = https.request(options, resp => {
      let data = ''
      resp.on('data', chunk => (data += chunk))
      resp.on('end', () => {
        try {
          resolve(JSON.parse(data))
        } catch (e) {
          console.log(e.message, data, uri)
        }
      })
    })

    req.on("error", reject)
    req.write(JSON.stringify(postData))
    req.end()
  })
}