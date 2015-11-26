'use strict'
var Plugin = require('vigour-wrapper/lib/bridge/plugin')
var agent = require('vigour-ua')(navigator.userAgent)
var browser = agent.browser
var env = global.env

var chromecast = module.exports = new Plugin({
  key: 'chromecast',
  session: {
    val: false,
    id: false
  },
  devices: false
})

if (env && (env.target === 'android' || env.target === 'ios')) {
  chromecast.inject(require('./native'))
} else if (browser && browser === 'chrome') {
  chromecast.inject(require('./web'))
} else {
  chromecast.inject(require('./mock'))
}
