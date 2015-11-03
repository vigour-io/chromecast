'use strict'

var Plugin = require('vigour-wrapper/lib/bridge/Plugin')
var name = require('../package.json').name

module.exports = exports = new Plugin({
  key: name
})
