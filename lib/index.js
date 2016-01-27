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
        condition (data, done) {
          console.log('[chromecast][session] val set')
          var session = this
          if (!session._block) {
            console.log('[chromecast][session] change came from internals block it')
            data = session.val
            let platform = session.parent._platform
            console.log('[chromecast][session] data is', data)
            if (data) {
              console.log('[chromecast][session] go emit connect')
              platform.emit('connect', {data, done})
            } else {
              console.log('[chromecast][session] go emit disconnect')
              platform.emit('disconnect')
              platform.once('stoppedCasting', done)
            }
          } else {
            console.log('[chromecast][session] change came from internals block it')
            done()
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
