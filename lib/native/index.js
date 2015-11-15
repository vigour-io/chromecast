'use strict'
var Observable = require('vigour-js/lib/observable')

var didInit

var ChromeCast = {
  devices: {
    define: {
      join (deviceId, name) {
        this.setKey(deviceId, {
          id: deviceId,
          name: name
        })
      },
      leave (deviceId) {
        this[deviceId].remove()
      }
    }
  },
  on: {
    value (data) {
      if (!didInit) {
        didInit = true
        this.bridge.send('ChromeCast', 'init', {appId: data})
      } else {
        throw new Error('ChromeCast appId can not be changed dynamically!')
      }
    },
    receive (event) {
      var plugin = this
      var type = event.type
      var data = event.data

      switch (type) {
        case 'join':
          plugin.devices.join(data.id, data.name)
          break
        case 'left':
          plugin.devices.leave(data.id)
          break
        case 'connected':
          // session filled with reference to deviceID
          plugin.session.set({
            id: data.sessionId
          })
          break
        case 'disconnected':
          // session as false
          plugin.session.val = false
          break
        default:
          plugin.emit('error', 'Event [' + type + '] is not implemented')
          break
      }
    }
  },
  define: {
    stopCasting () {
      // call disconnect on bridge
      this.bridge.send('ChromeCast', 'disconnect')
    },
    startCasting (device) {
      // call connect on bridge with deviceId
      this.session.val = device
      this.bridge.send('ChromeCast', 'connect', device.id.val)
    }
  }
}

module.exports = ChromeCast
