'use strict'
var Plugin = require('vigour-wrapper/lib/plugin')

module.exports = new Plugin({
  // TODO get appID from config
  inject: require('./platform'),
  appID: { useVal: 'default' },
  available: 0,
  devices: {},
  session: {
    val: false,
    id: false,
    on: {
      data: {
        condition (data, done, event) {
          var session = this
          var chromecast = session.parent
          if (event.origin.key === 'stoppedCasting') {
            // change came from the stoppedCasting handler
            done()
          } else {
            // change came from a set on session.val
            data = this.val
            if (data) {
              this.platform.emit('connect', {data, done})
            } else {
              chromecast.platform.emit('disconnect')
              chromecast.platform.once('stoppedCasting', done)
            }
          }
        }
      }
    }
  },
  val: false,
  on: {
    data: {
      condition (data, done) {
        if (this.val === true) {
          this.platform.emit('init', done)
        }
      }
    }
  }
})
