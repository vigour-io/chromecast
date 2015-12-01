'use strict'
var tests = require('../tests')

describe('Chromecast', function () {
  describe('Mock Plugin Tests', function () {
    tests(require('./mock'))
  })

  describe('Mock Bridge Tests', function () {
    tests(require('./bridge'))
  })
})
