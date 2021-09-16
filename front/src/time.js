module.exports = {

  time: timestamp => new Date(+timestamp * 1000).toLocaleTimeString(undefined, { hour12: false }),

  time1: timestamp => new Date(timestamp).toISOString().substr(11, 8),

  timeLeft: timestamp => new Date(timestamp*1000 - (new Date()).getTime()).toISOString().substr(11, 8),

}
