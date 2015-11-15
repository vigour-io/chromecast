' use strict'
// TODO get from config
const CHROMECAST_SCRIPT = 'https://www.gstatic.com/cv/js/sender/v1/cast_sender.js'

var ChromeCast = {
  on: {
    data (appId) {
      var script = getScript()
      window['__onGCastApiAvailable'] = (loaded, errorInfo) => {
        if (loaded) {
          var sessionRequest = new chrome.cast.SessionRequest(appId, [
            chrome.cast.Capability.VIDEO_OUT,
            chrome.cast.Capability.AUDIO_OUT],
            chrome.cast.timeout.requestSession)
          var apiConfig = new chrome.cast.ApiConfig(
            sessionRequest,
            sessionListener,
            receiverListener,
            chrome.cast.AutoJoinPolicy.TAB_AND_ORIGIN_SCOPED,
            chrome.cast.DefaultActionPolicy.CREATE_SESSION)
          chrome.cast.initialize(apiConfig, initSuccess, initError)
        } else {
          this.emit('error', errorInfo)
        }
      }
      document.getElementsByTagName('head')[0].appendChild(script)
    }
  },
  define: {
    stopCasting () {
      if (this.session) {
        this.session.stop()
      }
    },
    startCasting () {
      chrome.cast.requestSession(castInit, castError)
    }
  }
}

module.exports = ChromeCast

/**
 * Called on ChromeCast API init success
 */
var initSuccess = () => {
  this.pluginReady.val = true
  this.emit('loaded')
}

/**
 * Called on ChromeCast API init error
 * @param  {object}   err   ChromeCast API Error object
 */
var initError = (err) => {
  this.emit('error', {
    message: 'Init error',
    error: err
  })
}

/**
 * Error handler for chrome.cast
 * @param  {object}   err   ChromeCast error object
 */
var castError = (err) => {
  this.emit('error', {
    message: 'Cast error',
    error: err
  })
}

/**
 * cast init handler, emit a 'start' event
 * @param  {object}   session   ChromeCast session object
 */
var castInit = (session) => {
  // TODO do we need to override the session?
  this.emit('start')
}

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

/**
 * Sets the current session
 * @param  {object}   session   ChromeCast session
 */
var sessionListener = (session) => {
  // This line is added just for not breaking compatibility between different platforms
  session.id = session.sessionId
  this.session.set(session)
  this.emit('session', session)
}

/**
 * Callend when the API finish to scan for receivers
 * @param  {object}   event   ChromeCast API Event Object
 */
var receiverListener = (event) => {
  // TODO find better event names
  if (event === chrome.cast.ReceiverAvailability.AVAILABLE) this.emit('receiver')
  else this.emit('noreceiver')
}
