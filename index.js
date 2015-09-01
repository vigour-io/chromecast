var bridge = require('vigour-native/lib/bridge')
var pkg = require('./package.json')
var pluginId = pkg.vigour.plugin.id

module.exports = exports = {}

// If plugin requires initialization on the native side
bridge.call(pluginId, 'init', function (err) {
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
  bridge.call(pluginId, 'act', opts, cb)
}
