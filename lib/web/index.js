' use strict'
// TODO get from config
const CHROMECAST_SCRIPT = 'https://www.gstatic.com/cv/js/sender/v1/cast_sender.js'

var ChromeCast = {
  devices: false,
  on: {
    value (appId) {
      var plugin = this
      var script = getScript()
      window['__onGCastApiAvailable'] = (loaded, errorInfo) => {
        if (loaded) {
          // TODO use original one, this is for testing
          appId = chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID
          var sessionRequest = new chrome.cast.SessionRequest(appId, [
            chrome.cast.Capability.VIDEO_OUT,
            chrome.cast.Capability.AUDIO_OUT],
            chrome.cast.timeout.requestSession)
          var apiConfig = new chrome.cast.ApiConfig(
            sessionRequest,
            (chromeSession) => {
              console.log('CHROMESESSION', chromeSession)
              // This line is added just for not breaking compatibility between different platforms
              var session = {
                id: chromeSession.sessionId,
                chromeSession: {
                  useVal: chromeSession
                }
              }
              plugin.session.set(session)
            },
            (event) => {
              console.log('RECEIVER', chrome.cast.ReceiverAvailability.AVAILABLE, event)
              // TODO find better event names
              if (event === chrome.cast.ReceiverAvailability.AVAILABLE) plugin.devices.val = true
              else plugin.devices.val = false
            },
            chrome.cast.AutoJoinPolicy.TAB_AND_ORIGIN_SCOPED,
            chrome.cast.DefaultActionPolicy.CREATE_SESSION)
          chrome.cast.initialize(apiConfig, () => {
            console.log('init success')
            plugin.pluginReady.val = true
            plugin.emit('ready')
          }, (err) => {
            console.log('init error')
            plugin.emit('error', {
              message: 'Init error',
              error: err
            })
          })
        } else {
          plugin.emit('error', errorInfo)
        }
      }
      document.getElementsByTagName('head')[0].appendChild(script)
    }
  },
  define: {
    stopCasting () {
      var plugin = this
      if (plugin.session && plugin.session.chromeSession) {
        plugin.session.chromeSession.stop()
        plugin.session.set({
          val: false,
          id: false,
          chromeSession: null
        })
      }
    },
    startCasting () {
      var plugin = this
      plugin.session.val = true
      chrome.cast.requestSession((chromeSession) => {
        plugin.session.set({
          id: chromeSession.sessionId,
          chromeSession: {
            useVal: chromeSession
          }
        })
      }, (err) => {
        plugin.emit('error', {
          message: 'Cast error',
          error: err
        })
      })
    }
  }
}

module.exports = ChromeCast

/**
 * Create DOM script for ChromeCast API loading
 * @return {object}   DOM script node
 */
var getScript = () => {
  var script = document.createElement('script')
  script.onerror = () => {
    this.emit('error', 'Chromecast script load error')
  }
  script.src = CHROMECAST_SCRIPT
  script.id = 'chromecast-script'
  return script
}
