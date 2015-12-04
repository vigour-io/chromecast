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
