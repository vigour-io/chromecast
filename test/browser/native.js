'use strict'
var Plugin = require('vigour-wrapper/lib/bridge/plugin')
var nativeSender = require('../../lib/native')
var bridge = require('../../dev/bridge')
var shared = require('../../lib/shared')

describe('Native Plugin', function () {
  var plugin

  it('should be able to create a plugin instance', function (done) {
    plugin = new Plugin({
      inject: [shared, nativeSender]
    })
    plugin.ready.on('value', () => {
      expect(plugin.ready.val).to.be.true
      done()
    })
    plugin.val = 'myAppId'
  })

  describe('ChromeCast Sender', function () {
    var testDevice = {
      id: 'testDeviceId',
      name: 'testDeviceName'
    }

    it('should add devices passed through the \'join\' event', function () {
      // emulate device join
      bridge.receive(null, {type: 'deviceJoined', data: testDevice}, 'ChromeCast')
      expect(plugin.devices[testDevice.id]).to.exists
    })

    it('should remove devices passed through the \'leave\' event', function () {
      // emulate device leave
      bridge.receive(null, {type: 'deviceLeft', data: testDevice}, 'ChromeCast')
      expect(plugin.devices[testDevice.id]).to.not.exists
    })

    it('should be able to start casting to a device', function (done) {
      // fake device join
      bridge.receive(null, {type: 'deviceJoined', data: testDevice}, 'ChromeCast')
      // call startCasting for testDevice
      var device = plugin.devices[testDevice.id]
      expect(device).to.be.ok
      plugin.startCasting(device)

      expect(plugin.session.val).to.equal(device)
      // session.val === device >> "connecting OR connected" to device
      expect(plugin.session.id.val).to.equal(false)
      // state is now "connecting" because no session.id yet
      // wait for 'connected' event
      setTimeout(() => {
        // expect 'connected' event to have fired 1 time
        expect(plugin.session).to.exist
          .and.to.have.property('id')
          .which.has.property('val')
          .which.ok
        // state is now "connected" because I have a session id
        done()
      })
    })

    it('should be able to stop casting for a device', function (done) {
      // device already joined
      // call stopCasting for testDevice
      plugin.stopCasting()
      // session should be false
      // wait for 'disconnected' event
      setTimeout(() => {
        expect(plugin.session.val).to.be.false
        done()
      })
    })
  })
})
