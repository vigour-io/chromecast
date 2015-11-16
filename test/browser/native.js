'use strict'
var devBridge = require('vigour-wrapper/dev/bridge')
var nativeSender = require('../../lib/native')
var Plugin = require('vigour-wrapper/lib/bridge/plugin')

var ChromeCastPlugin = new Plugin({
  key: 'ChromeCast',
  session: false,
  pluginReady: false,
  inject: nativeSender
}).Constructor

describe('Native Plugin', function () {
  var plugin
  var bridge = window.vigour.native.bridge

  it('should be able to create a plugin instance', function (done) {
    plugin = new ChromeCastPlugin({
      key: 'ChromeCast',
      bridge: {
        useVal: devBridge
      },
      on: {
        ready () {
          done()
        }
      }
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
      bridge.receive(null, {type: 'join', data: testDevice}, 'ChromeCast')
      expect(plugin.devices[testDevice.id]).to.exists
    })

    it('should remove devices passed through the \'leave\' event', function () {
      // emulate device leave
      bridge.receive(null, {type: 'leave', data: testDevice}, 'ChromeCast')
      expect(plugin.devices[testDevice.id]).to.not.exists
    })

    it('should be able to start casting to a device', function (done) {
      // fake device join
      bridge.receive(null, {type: 'deviceJoined', data: testDevice}, 'ChromeCast')
      // call startCasting for testDevice
      console.log('burp?', testDevice.id)
      var device = plugin.devices[testDevice.id]
      expect(device).to.be.ok
      console.log('ok startcasting', device)
      plugin.startCasting(device)

      console.log('lala')

      expect(plugin.session.val).to.equal(device)
      // session.val === device >> "connecting OR connected" to device

      console.log('heyoo check property')

      expect(plugin.session).to.not.have.property('id')
      // state is now "connecting" because no session.id yet
      console.log('lol how')
      // wait for 'connected' event
      setTimeout(() => {
        // expect 'connected' event to have fired 1 time
        expect(plugin.session).to.exist
          .and.to.have.property('id')
          .which.has.property('val')
          .which.ok
        // state is now "connected" because I have a session id
        console.log('wet')
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
