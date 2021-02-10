"use strict"

const https = require("https")

module.exports = (uri, postData) => {
  const options = {
    hostname: process.env.KINGDOMS_HOST,
    port: 443,
    path: uri,
    method: 'POST',
    headers: {
      //"cookie": `__cmpcc=1; __cmpconsentx17155=CPBGGhcPBGGhcAfSDBRUBLCgAAAAAAAAAAigAAANzgBAMEAbmAAA; __cmpcvcx17155=__s94_s64_s1469_s65_s23_s69_s1433_c6085_s135_s1409_s24_s1475_c5973_c6446_s1078_U__; __cmpcpcx17155=__51__; gl5SessionKey=%7B%22key%22%3A%225b8a9c15b72627ea3488%22%2C%22id%22%3A%222875824%22%7D; gl5PlayerId=2875824; msid=gi36fhsa526kntbjgpbql7abb4; t5SessionKey=%7B%22key%22%3A%22ccab92dee1718629d721%22%2C%22id%22%3A%22170%22%7D; t5mu=1ZXdDhkc4hEThdUT; desktopNotifications=%7B%22action%22%3A%22accept%22%2C%22timestamp%22%3A1612470474314%7D; village=${postData.villageId}; t5socket=%22client602199bc26464%22`,
      "user-agent": 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Safari/537.36',
      "Content-Type": 'application/json'
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