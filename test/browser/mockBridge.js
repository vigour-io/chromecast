'use strict'
var bridge = require('vigour-wrapper/lib/bridge')
var mockbridge = window.vigour.native.bridge

var mockMethods = {
  init (opt, cb) {
    setTimeout(() => {
      // setup plugin and send ready
      mockbridge.ready(null, true, 'chromecast')
      // start device scans event with timeout
      setTimeout(() => {
        mockbridge.receive('deviceJoined', {id: 1, name: 'name01'}, 'chromecast')
        // mockbridge.receive(null, {type: 'deviceJoined', data: {id: 1, name: 'name01'}}, 'chromecast')
      })
    })
  },
  startCasting (deviceId, cb) {
    // sender start session
    // start casting once connected
    setTimeout(() => {
      cb(null, {
        sessionId: 'mocksession'
      })
      // mockbridge.receive('startedCasting', deviceId, 'chromecast')
      // mockbridge.receive(null, {type: 'startedCasting', data: deviceId}, 'chromecast')
    })
  },
  stopCasting () {
    // sender stop session
    // stop casting
    console.log('stopCasting!')
    setTimeout(() => {
      mockbridge.receive('stoppedCasting', null, 'chromecast')
      // mockbridge.receive(null, {type: 'stoppedCasting'}, 'chromecast')
    })
  }
}

bridge.define({
  send (pluginId, fnName, opts, cb) {
    mockMethods[fnName](opts, cb)
  }
})