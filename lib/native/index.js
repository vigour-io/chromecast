'use strict'
var ChromeCast = {
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
    deviceJoined (device) {
      // I felt a separate method for joining / leaving was overkill, just manipulate the devicelist here?
      this.devices.set({
        [device.id]: {
          id: device.id,
          name: device.name
        }
      })
    },
    deviceLeft (device) {
      // I felt a separate method for joining / leaving was overkill, just manipulate the devicelist here?
      // expect device to be passed not just id, could be useful for app devs listening for deviceLeft
      var chromecast = this
      var hasDevice = chromecast.devices[device.id]
      if (hasDevice) {
        if(chromecast.session.val === hasDevice) {
          chromecast.session.set({
            val: false,
            id: false
          })
        }
        hasDevice.remove()
      }
      // this is actually getting a bit big.. maybe
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
      // call disconnect on bridge
      var plugin = this
      plugin.bridge.send('ChromeCast', 'disconnect')
      plugin.session.set({
        val: false,
        id: false
      })
    },
    startCasting (device) {
      // call connect on bridge with deviceId
      var plugin = this
      plugin.session.val = device
      plugin.bridge.send('ChromeCast', 'connect', device.id.val)
    }
  }
}

module.exports = ChromeCast
