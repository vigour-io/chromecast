var Plugin = require('vigour-native/lib/bridge/Plugin')
var env

describe('plugin', function () {
  it('should be requireable', function () {
    env = require('../../')
    expect(env).instanceOf(Plugin)
    expect(env.key).to.equal('env')
  })

  describe('native events', function () {
    it('should forward the `ready` event', function () {
      var spy = sinon.spy()
      env.on('ready', spy)
      // Let's fake a ready event for this plugin
      window.vigour.native.bridge.ready(null, 'message 1', plugin.key)
      window.vigour.native.bridge.ready(null, 'message 2')
      expect(spy).calledOnce
    })

    it('should forward native `error` events', function () {
      var spy = sinon.spy()
      env.on('error', spy)
      // Let's fake a ready event for this plugin
      window.vigour.native.bridge.error('message 1', plugin.key)
      window.vigour.native.bridge.error('message 2')
      expect(spy).calledOnce
    })

    it('should forward pushed messages', function () {
      var spy = sinon.spy()
      env.on('receive', spy)
      // Let's fake a ready event for this plugin
      window.vigour.native.bridge.receive(null, 'message 1', plugin.key)
      window.vigour.native.bridge.receive(null, 'message 2')
      expect(spy).calledOnce
    })
  })
})
