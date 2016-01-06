'use strict'
var env = require('vigour-env')

if (env.isNative.val) {
  module.exports = require('./native')
} else if (env.isWeb.val && env.browser.val === 'chrome') {
  module.exports = require('./web')
} else {
  console.warn('this platform is deemed chromecast incompatible')
}
