'use strict'
var tests = require('../tests')

describe('Chromecast', function () {
  describe('Mock Plugin Tests', function () {
    tests(require('../../lib/platform/mock'), 'platform')
  })

  describe('Mock Bridge Tests', function () {
    var mockBridge = require('./mockBridge')
    var nativePlatform = require('../../lib/platform/native')
    tests(nativePlatform, mockBridge)
  })
})
