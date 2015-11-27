'use strict'
var bridge = require('vigour-wrapper/lib/bridge')
var mockbridge = window.vigour.native.bridge

var mockMethods = {
  init (data) {
    setTimeout(() => {
      // setup plugin and send ready
      mockbridge.ready(null, true, 'chromecast')
      // start device scans event with timeout
      setTimeout(() => {
        mockbridge.receive(null, {type: 'deviceJoined', data: {id: 1, name: 'name01'}}, 'chromecast')
      })
    })
  },
  startCasting (deviceId) {
    // sender start session
    // start casting once connected
    setTimeout(() => {
      mockbridge.receive(null, {type: 'startedCasting', data: deviceId}, 'chromecast')
    })
  },
  stopCasting () {
    // sender stop session
    // stop casting
    setTimeout(() => {
      mockbridge.receive(null, {type: 'stoppedCasting'}, 'chromecast')
    })
  }
}
bridge.define({
  send: function (pluginId, fnName, opts, cb) {
    return mockMethods[fnName](opts, cb)
  }
})

module.exports = bridge
