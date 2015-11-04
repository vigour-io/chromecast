'use strict'

var Plugin = require('vigour-native/lib/bridge/Plugin')
var name = require('../package.json').name
var vigourChromeCastApi = require("./chomecastWeb")

module.exports = exports = new Plugin({
  key: name,
  castApp: vigourChromeCastApi.castApp,
  stopVideo: vigourChromeCastApi.stopVideo,
  stopSession: vigourChromeCastApi.stopSession
})
