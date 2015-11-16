'use strict'
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
      if (this.pluginReady.val) {
        this.emit('error', 'ChromeCast plugin already started')
        return
      }
      this.bridge.send('ChromeCast', 'init', {appId: data})
    },
    ready (/* data */) {
      this.pluginReady.val = true
    },
    receive (event) {
      var plugin = this
      var type = event.type
      var data = event.data

      switch (type) {
        case 'device-joined':
          plugin.devices.join(data.id, data.name)
          break
        case 'device-left':
          plugin.devices.leave(data.id)
          break
        case 'started-casting':
          // session filled with reference to deviceID
          plugin.session.set({
            id: data.sessionId
          })
          break
        case 'stopped-casting':
          // session as false
          plugin.session.set({
            val: false,
            id: false
          })
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
