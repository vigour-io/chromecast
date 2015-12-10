'use strict'
var env = require('vigour-env')

if (env.isNative.val) {
  module.exports = require('./native')
} else if (env.isWeb.val) {
  module.exports = require('./web')
} else {
  module.exports = require('./mock')
}
