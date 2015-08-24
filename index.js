var bridge = require('vigour-native/lib/bridge')
var env = require('vigour-native/lib/env')
// var name = 'plugin'
var id = 'vigour-native-plugin'
var supportedPlatforms = [
  'android',
  'ios'
]
var supportedDevices = [
  'phone',
  'tablet'
]

module.exports = exports = {}

exports.usable = ~supportedDevices.indexOf(env.ua.device) &&
  ~supportedPlatforms.indexOf(env.ua.platform)

exports.act = function (opts, cb) {
  // var error
  if (!cb) {
    cb = opts
    opts = null
  }
  bridge.call(id, 'act', opts, cb)
}
