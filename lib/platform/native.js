'use strict'
var pkg = require('../../package.json')

exports._platform = {
  inject: require('vigour-wrapper/lib/bridge/inject')(pkg.name),
  on: {
    init: {
      chromecast (done) {
        this.send('init', {appId: this.appID}, () => {
          this.parent.set({
            val: true,
            ready: true
          })
          if (done) {
            done()
          }
        })
      }
    },
    connect: {
      chromecast (obj) {
        var plugin = this.parent
        var device = obj.data
        var deviceid = device.id || plugin.devices.each(function (property) {
          return property.id
        })
        if (deviceid) {
          this.send('startCasting', deviceid.val, (err, res) => {
            if (!err) {
              plugin.session.id.val = res.sessionId
              obj.done()
            } else {
              obj.done(true)
            }
          })
        } else {
          this.emit('error', 'Chromecast: No deviceid specified or found')
        }
      }
    },
    disconnect: {
      chromecast (data) {
        this.send('stopCasting')
      }
    },
    stoppedCasting: {
      condition (data, done, event) {
        this.parent.session.set({
          val: false,
          id: false
        }, event.inherits)
        done()
      }
    },
    deviceJoined: {
      chromecast (device) {
        var plugin = this.parent
        plugin.set({
          available: plugin.available.val + 1,
          devices: {
            [device.id]: {
              id: device.id,
              name: device.name
            }
          }
        })
      }
    },
    deviceLeft: {
      chromecast (device) {
        var plugin = this.parent
        var hasDevice = plugin.devices[device.id]
        if (hasDevice) {
          plugin.available.val -= 1
          if (plugin.session.val === hasDevice) {
            plugin.session.set({
              val: false,
              id: false
            })
          }
          hasDevice.remove()
        }
      }
    }
  }
}
