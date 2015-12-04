'use strict'
var tests = require('../tests')

describe('Chromecast', function () {
  describe('Mock Plugin Tests', function () {
    tests(require('./mockPlatform'))
  })

  describe('Mock Bridge Tests', function () {
    var nativePlatform = require('../../lib/platform/native')
    require('./mockBridge')
    tests(nativePlatform)
  })
})
