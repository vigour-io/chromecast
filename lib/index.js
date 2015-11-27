'use strict'
var agent = require('vigour-ua')(navigator.userAgent)
var browser = agent.browser
var env = global.env

if (env && (env.target === 'android' || env.target === 'ios')) {
  module.exports = require('./native')
} else if (browser && browser === 'chrome') {
  module.exports = require('./web')
} else {
  module.exports = require('./mock')
}
