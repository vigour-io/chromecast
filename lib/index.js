var ua = require('vigour-ua')
var Plugin = require('vigour-wrapper/lib/bridge/plugin')
var Observable = require('vigour-js/lib/observable')
var implementation
var shared = require('./shared')

var agent = ua(navigator.userAgent)
var platform
if (agent.device === 'phone' || agent.device === 'tablet' &&
  agent.platform === 'android' || agent.platform === 'ios') {
  // native sender
  implementation = require('./native')
  platform = new Plugin({
    inject: [shared, implementation]
  })
} else if (agent.browser && agent.browser === 'chrome') {
  implementation = require('./web')
  platform = new Plugin({
    inject: [shared, implementation]
  })
} else {
  // incompatible
  platform = new Observable({
    val: false
  })
}

module.exports = platform
