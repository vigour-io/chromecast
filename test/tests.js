'use strict'
module.exports = function (inject, type) {
  var chromecast

  it('require chromecast', function () {
    chromecast = require('../lib')
  })

  if (inject) {
    it('create instance with mock properties', function () {
      chromecast = new chromecast.Constructor(inject)
    })
  }

  it('values before initialisation', function () {
    expect(chromecast.available.val).equals(0)
    expect(chromecast.session.val).equals(false)
    expect(chromecast.session.id.val).equals(false)
    expect(chromecast.val).equals(false)
  })

  it('initialise chromecast, with devices available', function (done) {
    this.timeout(25000)
    console.log('--------------- initialise chromecast, with devices available')
    chromecast.available.once(function () {
      expect(chromecast.available.val).ok
      expect(chromecast.session.val).equals(false)
      expect(chromecast.session.id.val).equals(false)
      expect(chromecast.val).equals(true)
      done()
    })
    chromecast.val = true
  })

  it('connect to device', function (done) {
    this.timeout(25000)
    console.log('--------------- connect to device')
    chromecast.session.once(function () {
      expect(chromecast.val).equals(true)
      expect(chromecast.available.val).ok
      expect(chromecast.session.val).equals(true)
      expect(chromecast.session.id.val).ok
      done()
    })
    chromecast.session.val = true
  })

  it('disconnect from device', function (done) {
    this.timeout(25000)
    console.log('--------------- disconnect from device')
    chromecast.session.once(function () {
      console.log('lals session once!')
      expect(chromecast.val).equals(true)
      expect(chromecast.available.val).ok
      expect(chromecast.session.val).not.ok
      expect(chromecast.session.id.val).not.ok
      done()
    })
    chromecast.session.val = 0
  })
}
