'use strict'
var chromecast = require('../../lib')
var Observable = require('vigour-js/lib/observable')
Observable.prototype.inject(require('vigour-js/lib/observable/is'))

const APP_ID = 'default'
const ENV = global.env
const IS_NATIVE = ENV && (ENV === 'ios' || ENV === 'android')

// if (!global.alert) {
  global.alert = function (msg) {
    console.info(msg)
  }
// }

describe('Chromecast plugin manual tests', function () {
  it('Initialises the API when setting the value to the app ID', function (done) {
    chromecast.val = APP_ID
    chromecast.ready.is(true, function () {
      done()
    })
  })

  it('Enable receiver on the network => device is available in the plugin (timeout 20000)', function (done) {
    this.timeout(20000)
    global.alert('Enable receiver on the network')
    chromecast.devices.is(function (val) {
      return !!val
    }, function () {
      if (IS_NATIVE) {
        this.each(function (device) {
          if (this.id.val && this.name.val) {
            done()
          }
        })
        done(true)
      } else {
        expect(this.val).ok
        done()
      }
    })
  })

  it('Calling .startCasting(device) => Starts casting on receiver (timeout 20000)', function (done) {
    var device
    this.timeout(20000)
    chromecast.devices.each(function (property) {
      device = property
    })
    chromecast.session.is(function (val) {
      return !!val
    }, function () {
      this.id.is(function (val) {
        return !!val
      }, function () {
        done()
      })
    })
    chromecast.startCasting(device)
  })

  it('Calling .stopCasting() => Stops casting on receiver (timeout 20000)', function (done) {
    this.timeout(20000)
    chromecast.session.is(function (val) {
      return !val
    }, function () {
      this.id.is(function (val) {
        return !val
      }, function () {
        done()
      })
    })
    chromecast.stopCasting()
  })

  it('Take receiver offline => No devices are available in the plugin (timeout 20000)', function (done) {
    this.timeout(20000)
    global.alert('Take receiver offline')
    chromecast.devices.once(function () {
      if (IS_NATIVE) {
        chromecast.devices.each(function () {
          done(true)
        })
        done()
      } else {
        expect(chromecast.devices.val).not.equals(true)
        done()
      }
    })
  })
})
