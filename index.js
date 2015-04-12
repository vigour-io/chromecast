var bridge = require('vigour-native/lib/bridge')
  , env = require('vigour-native/lib/env')
  , name = "plugin"
  , id = "vigour-native-plugin"
  , supportedPlatforms = [
    'android'
    , 'ios'
  ]
  , supportedDevices = [
    'phone'
    , 'tablet'
  ]

module.exports = exports = {}

exports.usable = ~supportedDevices.indexOf(env.ua.device)
  && ~supportedPlatforms.indexOf(env.ua.platform)

exports.act = function (opts, cb) {
  var error
  if (!cb) {
    cb = opts
    opts = null
  }
  bridge.call(id, "act" ,opts, cb)
}
