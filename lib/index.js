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
        condition (data, done) {
          data = this.val
          if (data) {
            this.platform.emit('connect', {data, done})
          } else {
            this.platform.emit('disconnect', done)
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
