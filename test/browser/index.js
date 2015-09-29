var Plugin = require('vigour-native/lib/bridge/Plugin')
var name = require('../../package.json').name
var plugin

describe('plugin', function () {
  it('should be requireable', function () {
    plugin = require('../../')
    expect(plugin).instanceOf(Plugin)
    expect(plugin.key).to.equal(name)
  })

  describe('native events', function () {
    it('should forward the `ready` event', function () {
      var spy = sinon.spy()
      plugin.on('ready', spy)
      // Let's fake a ready event for this plugin
      window.vigour.native.bridge.ready(null, 'message 1', name)
      window.vigour.native.bridge.ready(null, 'message 2')
      expect(spy).calledOnce
    })

    it('should forward native `error` events', function () {
      var spy = sinon.spy()
      plugin.on('error', spy)
      // Let's fake a ready event for this plugin
      window.vigour.native.bridge.error('message 1', name)
      window.vigour.native.bridge.error('message 2')
      expect(spy).calledOnce
    })

    it('should forward pushed messages', function () {
      var spy = sinon.spy()
      plugin.on('receive', spy)
      // Let's fake a ready event for this plugin
      window.vigour.native.bridge.receive(null, 'message 1', name)
      window.vigour.native.bridge.receive(null, 'message 2')
      expect(spy).calledOnce
    })
  })
})
