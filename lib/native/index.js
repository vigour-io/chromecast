'use strict'
var Plugin = require('vigour-wrapper/lib/bridge/plugin')

module.exports = new Plugin({
  inject: require('../shared'),
  on: {
    value (data) {
      if (!this.ready.val) {
        this.send('init', {appId: data})
      } else {
        this.emit('error', 'ChromeCast plugin already started')
      }
    },
    deviceJoined (device) {
      this.devices.set({
        [device.id]: {
          id: device.id,
          name: device.name
        }
      })
    },
    deviceLeft (device) {
      var hasDevice = this.devices[device.id]
      if (hasDevice) {
        if (this.session.val === hasDevice) {
          this.session.set({
            val: false,
            id: false
          })
        }
        hasDevice.remove()
      }
    },
    startedCasting (data) {
      this.session.set({
        id: data.sessionId
      })
    },
    stoppedCasting () {
      this.session.set({
        val: false,
        id: false
      })
    }
  },
  define: {
    stopCasting () {
      this.send('stopCasting', function (err) {
        if (err) {
          throw new Error(err)
        }
      })
    },
    startCasting (device) {
      if (!device) {
        throw new Error('No receiver device defined')
      }
      this.send('startCasting', device.id.val, () => {
        this.session.val = device
      })
    }
  }
})
