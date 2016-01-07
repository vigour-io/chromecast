'use strict'

var config = require('../config')
var pkg = require('../../package.json')

exports._platform = {
  inject: require('vigour-wrapper/lib/bridge/inject')(pkg.name),
  label: 'native',
  on: {
    init: {
      chromecast (done) {
        this.send('init', {appId: config.appId.val}, () => {
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
        console.log('[native] on connect')
        var plugin = this.parent
        var device = obj.data
        var deviceid = device.id || plugin.devices.each(function (property) {
          return property.id
        })
        if (deviceid) {
          console.log('[native] SEND deviceid', deviceid)
          this.send('startCasting', deviceid.val, (err, res) => {
          console.log('[native] CALLBACK', err, res)
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
          console.log('found device > stop session and remove!')
          plugin.available.val -= 1
          if (plugin.session.val === hasDevice) {
            plugin.session.set({
              val: false,
              id: false
            })
          }
          hasDevice.remove()
        } else {
          console.warn('a device that left was not in devices')
        }
      }
    }
  }
}
