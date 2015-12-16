'use strict'
var bridge = require('vigour-wrapper/lib/bridge')

bridge.label = 'mockBridge'
bridge.mock = {
  methods: {
    init (opt, cb) {
      setTimeout(() => {
        // setup plugin and send ready
        bridge.ready(null, true, 'chromecast')
        // start device scans event with timeout
        setTimeout(() => {
          bridge.receive('deviceJoined', {id: 1, name: 'name01'}, 'chromecast')
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
        bridge.receive('stoppedCasting', null, 'chromecast')
        // mockbridge.receive(null, {type: 'stoppedCasting'}, 'chromecast')
      })
    }
  }
}

delete bridge.send

bridge.define({
  send (pluginId, fnName, opts, cb) {
    bridge.mock.methods[fnName](opts, cb)
  }
})

module.exports = bridge
