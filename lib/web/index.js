'use strict'
var Observable = require('vigour-js/lib/observable')

const SCRIPT_SRC = 'https://www.gstatic.com/cv/js/sender/v1/cast_sender.js'
const SCRIPT_ID = 'chromecast-script'
const READY = 'ready'
const ERROR = 'error'

module.exports = new Observable({
  inject: require('../shared'),
  ready: false,
  on: {
    value (appId) {
      var script = document.createElement('script')
      script.onerror = () => {
        this.emit(ERROR, 'Chromecast script load error')
      }
      script.src = SCRIPT_SRC
      script.id = SCRIPT_ID
      window.__onGCastApiAvailable = (loaded, error) => {
        if (loaded) {
          this.init(appId)
        } else {
          this.emit(ERROR, error)
        }
      }
      document.getElementsByTagName('head')[0].appendChild(script)
    }
  },
  define: {
    init (appId) {
      if (appId === 'default') {
        appId = chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID
      }
      var cast = window.chrome.cast
      var request = new cast.SessionRequest(
        appId, [
          cast.Capability.VIDEO_OUT,
          cast.Capability.AUDIO_OUT
        ],
        cast.timeout.requestSession)
      var session = (chromeSession) => {
        // This line is added just for not breaking compatibility between different platforms
        // This function will be called automatically when a session is alive and chromecast detects it.
        // handy for managing the current casting app.
        this.session.set({
          id: chromeSession.sessionId
        })
        this.session.chromeSession = chromeSession
      }
      var listener = (event) => {
        // TODO find better event names
        this.devices.val = event === cast.ReceiverAvailability.AVAILABLE
      }
      var apiConfig = new cast.ApiConfig(
        request,
        session,
        listener,
        cast.AutoJoinPolicy.TAB_AND_ORIGIN_SCOPED
      )
      var success = () => {
        this.setKey(READY, true)
        this.emit(READY)
      }
      var error = (err) => {
        this.emit(ERROR, {
          message: 'Init error',
          error: err
        })
      }
      cast.initialize(apiConfig, success, error)
    },
    stopCasting () {
      var session = this.session
      if (session && session.chromeSession) {
        session.chromeSession.stop()
        session.set({
          val: false,
          id: false
        })
        delete session.chromeSession
      }
    },
    startCasting () {
      var session = this.session
      var success = (chromeSession) => {
        // TODO do we need to override the session?
        session.val = true
        session.set({
          id: chromeSession.sessionId,
          val: {
            useVal: chromeSession
          }
        })
        session.chromeSession = chromeSession
      }
      var error = (err) => {
        this.emit(ERROR, {
          message: 'Cast error',
          error: err
        })
      }
      window.chrome.cast.requestSession(success, error)
    }
  }
})
