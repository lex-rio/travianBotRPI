"use strict"

const https = require("https")

module.exports = (options, postData) => {
  return new Promise((resolve, reject) => {
    const req = https.request(options, resp => {
      let data = ''
      resp.on('data', chunk => (data += chunk))
      resp.on('end', () => (resolve(JSON.parse(data))))
    })

    req.on("error", reject)
    req.write(JSON.stringify(postData))
    req.end()
  })
}