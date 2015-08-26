var bridge = require('vigour-native/lib/bridge')
var pkg = require('./package.json')
var pluginId = pkg.vigour.plugin.id

module.exports = exports = {}

exports.bridgeSend = function (fn, opts, cb) {
  if (!cb) {
    cb = opts
    opts = null
  }
  bridge.send(pluginId, fn, opts, cb)
}

// TODO Everything above this line feels like boilerplate
// and should probably be moved to lib/bridge somehow

bridge.on('ready', function (pluginId) {
  if (!pluginId) {
    // Everything is ready
  } else {
    // plugin with id pluginId is ready
  }
})

// If plugin requires initialization on the native side
exports.bridgeSend('init', function (err) {
  if (!err) {
    // Native part is ready and initialized
  } else {
    throw err
  }
})

exports.init = function () {
  // Do something
}

exports.act = function (opts, cb) {
  exports.bridgeSend('act', opts, cb)
}
