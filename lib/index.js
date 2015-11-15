var ua = require('vigour-ua')
var Plugin = require('vigour-wrapper/lib/bridge/Plugin')

var nativeSender = require('./native')
var chromeSender = require('./web')
var receiver = require('./receiver')

var myPlatform
if (ua.device === 'phone' && ua.platform === 'android' || ua.platform === 'ios') {
  // native sender
  myPlatform = nativeSender
} else if (ua.browser && ua.browser.name === 'chrome') {
  // this is browser madneeeeeees
  myPlatform = chromeSender
} else if (ua.device === 'chromecast') {
  // yo yo I'm a receiver
  myPlatform = receiver
} else { // incompatible
  myPlatform = {
    val: false
  }
}

module.exports = new Plugin({
  key: 'ChromeCast',
  session: false,
  scritpLoaded: false,
  inject: myPlatform
})
