var ua = require('vigour-ua')
var Plugin = require('vigour-wrapper/lib/bridge/Plugin')

var nativeSender = require('./native')
var chromeSender = require('./web')
var receiver = require('./receiver')

var myPlatform
if (ua.os === 'Android' || ua.os === 'iOS') {
  myPlatform = nativeSender
} else if (ua.browser && ua.browser.name === 'Chrome') {
  myPlatform = chromeSender
} else if (ua.os === 'Chrome') {
  myPlatform = receiver
} else { // incompatible
  myPlatform = {
    val: false
  }
}

module.exports = new Plugin({
  key: 'ChromeCast',
  session: false,
  inject: myPlatform
})
