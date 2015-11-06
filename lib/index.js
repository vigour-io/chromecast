'use strict'

var Plugin = require('vigour-native/lib/bridge/Plugin')
var name = require('../package.json').name
var vigourChromeCastWebApi = require("./chromecastWeb")

module.exports = exports = new Plugin({
  key: name,
  castApp: vigourChromeCastWebApi.castApp,
  stopVideo: vigourChromeCastWebApi.stopVideo,
  stopSession: vigourChromeCastWebApi.stopSession
})
