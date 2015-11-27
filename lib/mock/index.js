'use strict'
var Observable = require('vigour-js/lib/observable')

module.exports = new Observable({
  inject: require('../shared'),
  define: {
    init: mockWarning,
    stopCasting: mockWarning,
    startCasting: mockWarning
  }
})

function mockWarning () {
  console.warn('Mock Chromecast: Can\'t do this on this platform.')
}
