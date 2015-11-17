var ua = require('vigour-ua')
var Plugin = require('vigour-wrapper/lib/bridge/Plugin')

var nativeSender = require('./native')
var chromeSender = require('./web')
var shared = require('./shared')

var agent = ua(navigator.userAgent)
var platform
if (agent.device === 'phone' || agent.device === 'tablet' &&
  agent.platform === 'android' || agent.platform === 'ios') {
  // native sender
  platform = nativeSender
} else if (agent.browser && agent.browser === 'chrome') {
  // this is browser madneeeeeees
  platform = chromeSender
// } else if (agent.device === 'chromecast') {
//   // yo yo I'm a receiver
//   platform = receiver
} else { // incompatible
  platform = {
    val: false
  }
}

// TODO shouldn't we export just the plugin and then let the user decide how to instantiate a new one?
module.exports = new Plugin({
  inject: [platform, shared]
})
