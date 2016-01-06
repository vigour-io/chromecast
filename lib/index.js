'use strict'
var Plugin = require('vigour-wrapper/lib/plugin')

var config = require('./config')

module.exports = new Plugin({
  // TODO get appId from config
  inject: require('./platform'),
  appId: config.appId.val,
  available: 0,
  devices: {},
  session: {
    val: false,
    id: false,
    on: {
      data: {
        condition (data, done, event) {
          var session = this
          if (event.origin.key === 'stoppedCasting') {
            // change came from the stoppedCasting handler
            done()
          } else {
            // change came from a set on session.val
            data = this.val
            let platform = session.parent._platform
            if (data) {
              platform.emit('connect', {data, done})
            } else {
              platform.emit('disconnect')
              platform.once('stoppedCasting', done)
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
          this._platform.emit('init', done)
        }
      }
    }
  }
})
