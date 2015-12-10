'use strict'
var env = require('vigour-env')

if (env.isNative.val) {
  module.exports = require('./mock')
} else if (env.isWeb.val) {
  module.exports = require('./web')
} else {
  module.exports = require('./mock')
}
