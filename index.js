var bridge = require('vigour-native/lib/bridge')
var pkg = require('./package.json')
var pluginId = pkg.vigour.plugin.id

module.exports = exports = {}

exports.bridgeCall = function (fn, opts, cb) {
  if (!cb) {
    cb = opts
    opts = null
  }
  bridge.call(pluginId, fn, opts, cb)
}

// TODO Everything above this line feels like boilerplate
// and should probably be moved to lib/bridge somehow

// If plugin requires initialization on the native side
exports.bridgeCall('init', function (err) {
  if (!err) {
    // Native part is ready
    exports.init()
  } else {
    throw err
  }
})

exports.init = function () {
  // Do something
}

exports.act = function (opts, cb) {
  exports.bridgeCall('act', opts, cb)
}
