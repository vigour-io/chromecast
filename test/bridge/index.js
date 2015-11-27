'use strict'
// tests data flows between native and js side using the bridge (if native) or the mock (if browser)
describe('Testing data flows between native and js using the bridge', () => {
  require('../../lib/native')
  var bridge = window.vigour.native.bridge /* require('../mockBridge') */

  // bridge.send(pluginId, fnName, opts, cb)
  // bridge.ready(err, response, pluginId)

  describe('Testing data flows for bridge', function () {
    // init starts the current flow
    // - initialize the plugin --> call the ready event with data true
    // - start scanning for devices and for every device available will call the receive with the device, eg: { type: 'deviceJoined', device:: Object }
    it('after init it should send back the devices available', function (done) {
      this.timeout(30 * 1000)
      var readySpy = sinon.spy(bridge, 'ready')
      var joinSpy = sinon.spy(bridge, 'receive')
      bridge.send('chromecast', 'init', null, null)
      setTimeout(() => {
        expect(readySpy).to.have.been.calledWithExactly(null, true, 'chromecast')
        expect(joinSpy).to.have.been.calledWith(null, {type: 'deviceJoined', data: sinon.match.typeOf('object')}, 'chromecast')
        bridge.ready.restore()
        bridge.receive.restore()
        done()
      }, 25 * 1000)
    })
    // startCasting will receive a deviceId and will start casting for that device, flow will be:
    // - receiving the deviceId with 'startCasting'
    // - calling receive once the casting started for that device, eg: {type: 'startedCasting', data: deviceId}
    it('when calling startCasting it will receive the deviceId and start casting for it', function (done) {
      this.timeout(30 * 1000)
      var spy = sinon.spy(bridge, 'receive')
      bridge.send('chromecast', 'startCasting', 'myDeviceId', null)
      setTimeout(() => {
        expect(spy).to.have.been.calledWithExactly(null, {type: 'startedCasting', data: 'myDeviceId'}, 'chromecast')
        bridge.receive.restore()
        done()
      }, 25 * 1000)
    })
    // stopCasting will stop casting for the current device, flow will be:
    // - receiving the 'stopCasting' command
    // - calling receive once the casting stopped, eg: {type: 'stoppedCasting'}
    it('when calling stopcasting it will stop casting for the current devcie', function (done) {
      this.timeout(30 * 1000)
      var spy = sinon.spy(bridge, 'receive')
      bridge.send('chromecast', 'stopCasting')
      setTimeout(() => {
        expect(spy).to.have.been.calledWithExactly(null, {type: 'stoppedCasting'}, 'chromecast')
        bridge.receive.restore()
        done()
      }, 25 * 1000)
    })
  })
})
