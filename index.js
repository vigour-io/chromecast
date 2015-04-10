var bridge = require('vigour-native/lib/bridge')

module.exports = exports = {}

exports.act = function (opts, cb) {
  if (opts.breaks) {
    cb(new Error("Broke"))
  } else {
    cb(null, "Success")
  }
}