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
    deviceJoined (device) {
      console.log('DEVICE JOINED!', device)
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
    startedCasting () {

    },
    stoppedCasting () {

    },
    receive (event) {
      console.log('STILL EMITTING RECEIVE?!')

      // var plugin = this
      // var type = event.type
      // var data = event.data
      //
      // switch (type) {
      //   case 'deviceJoined':
      //     plugin.devices.join(data.id, data.name)
      //     break
      //   case 'deviceLeft':
      //     plugin.devices.leave(data.id)
      //     break
      //   case 'started-casting':
      //     // session filled with reference to deviceID
      //     plugin.session.set({
      //       id: data.sessionId
      //     })
      //     break
      //   case 'stopped-casting':
      //     // session as false
      //     plugin.session.set({
      //       val: false,
      //       id: false
      //     })
      //     break
      //   default:
      //     plugin.emit('error', 'Event [' + type + '] is not implemented')
      //     break
      // }
    }
  },
  define: {
    stopCasting () {
      // call disconnect on bridge
      var plugin = this
      plugin.bridge.send('ChromeCast', 'disconnect')
      plugin.session.set({
        val: false,
        id: false,
        chromeSession: null
      })
    },
    startCasting (device) {
      // call connect on bridge with deviceId
      var plugin = this
      plugin.session.val = device
      console.log('whats with this device?!', device)
      plugin.bridge.send('ChromeCast', 'connect', device.id.val)
    }
  }
}

module.exports = ChromeCast
