'use strict'
var Observable = require('vigour-js/lib/observable')

const SCRIPT_SRC = 'https://www.gstatic.com/cv/js/sender/v1/cast_sender.js'
const SCRIPT_ID = 'chromecast-script'
const READY = 'ready'
const ERROR = 'error'

module.exports = new Observable({
  inject: require('../shared'),
  loading: false,
  ready: false,
  on: {
    value (appId) {
      if (appId) {
        this.init(appId)
      }
    }
  },
  define: {
    init (appId) {
      appId = appId || this.appId
      if (!appId) {
        throw new Error('No app id defined')
      }
      if (this.initialised) {
        this.ready.is(true, () => this.initInternal(appId))
      } else {
        let script = document.createElement('script')
        script.onerror = () => {
          this.initialised = false
          this.emit(ERROR, 'Chromecast script load error')
        }
        script.src = SCRIPT_SRC
        script.id = SCRIPT_ID
        window.__onGCastApiAvailable = (loaded, error) => {
          if (loaded) {
            this.initInternal(appId)
          } else {
            this.emit(ERROR, error)
          }
        }
        document.getElementsByTagName('head')[0].appendChild(script)
        this.initialised = true
      }
    },
    initInternal (appId) {
      var cast = window.chrome.cast
      if (appId === 'default') {
        appId = cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID
      }
      var request = new cast.SessionRequest(
        appId, [
          cast.Capability.VIDEO_OUT,
          cast.Capability.AUDIO_OUT
        ],
        cast.timeout.requestSession)
      var session = (chromeSession) => {
        this.session.set({
          id: chromeSession.sessionId
        })
        this.session.chromeSession = chromeSession
      }
      var listener = (event) => {
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
