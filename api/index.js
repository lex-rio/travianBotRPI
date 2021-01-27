const telegram = require('./../telegram')

const router = {
  'test': () => {
    telegram.alert('test passed')
    return 123
  }
}

module.exports = { router }