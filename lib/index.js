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
          console.log('[session] val set')
          var session = this
          if (event.origin.key === 'stoppedCasting') {
            // change came from the stoppedCasting handler
            console.log('[session] change came from the stoppedCasting handler')
            done()
          } else {
            // change came from a set on session.val
            data = this.val
            let platform = session.parent._platform
            console.log('[session] data is', data)
            if (data) {
              console.log('[session] go emit connect')
              platform.emit('connect', {data, done})
            } else {
              console.log('[session] go emit disconnect')
              platform.emit('disconnect')
              platform.once('stoppedCasting', done)
            }
          }
        },
        val: function () {}
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
      },
      val: function () {}
    }
  }
})
