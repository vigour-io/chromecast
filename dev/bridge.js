'use strict'
var bridge = require('vigour-wrapper/lib/bridge')
var mockbridge = window.vigour.native.bridge

var mockMethods = {
  init (data) {
    setTimeout(() => {
      // setup plugin and send ready
      mockbridge.ready(null, true, 'ChromeCast')
      /// start device scans event with timeout
      startFakeDevicesScan()
    })
  },
  startCasting (deviceId) {
    // sender start session
    // start casting once connected
    setTimeout(() => {
      startCasting(deviceId)
    })
  },
  stopCasting () {
    // sender stop session
    // stop casting
    setTimeout(() => {
      stopCasting()
    })
  }
}
bridge.define({
  send: function (pluginId, fnName, opts, cb) {
    return mockMethods[fnName](opts, cb)
  }
})

module.exports = bridge

// fake, used for dev
var stopCasting = () => {
  mockbridge.receive(null, {type: 'stoppedCasting'}, 'ChromeCast')
}

// fake, used for dev
var startCasting = (deviceId) => {
  mockbridge.receive(null, {type: 'startedCasting', data: deviceId}, 'ChromeCast')
}

// fake, used for dev
var startFakeDevicesScan = () => {
  var devices = [
    {id: 1, name: 'name01'},
    {id: 2, name: 'name02'},
    {id: 3, name: 'name03'}]
  let iter = (device) => {
    if (!device) return
    setTimeout(() => {
      mockbridge.receive(null, {type: 'join', data: device}, 'ChromeCast')
      iter(devices.shift())
    })
  }
  iter(devices.shift())
}
