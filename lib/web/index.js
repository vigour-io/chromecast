'use strict'
// TODO get from config
const CHROMECAST_SCRIPT = 'https://www.gstatic.com/cv/js/sender/v1/cast_sender.js'

exports.on = {
  value (appId) {
    var script = document.createElement('script')
    script.onerror = () => {
      this.emit('error', 'Chromecast script load error')
    }
    script.src = CHROMECAST_SCRIPT
    script.id = 'chromecast-script'
    window['__onGCastApiAvailable'] = (loaded, errorInfo) => {
      if (loaded) {
        // TODO use original one, this is for testing
        var cast = window.chrome.cast
        var sessionRequest = new cast.SessionRequest(
          appId, [
            cast.Capability.VIDEO_OUT,
            cast.Capability.AUDIO_OUT
          ],
          cast.timeout.requestSession)

        var apiConfig = new cast.ApiConfig(
          sessionRequest, (chromeSession) => {
            // This line is added just for not breaking compatibility between different platforms
            // This function will be called automatically when a session is alive and chromecast detects it.
            // handy for managing the current casting app.
            var session = {
              id: chromeSession.sessionId,
              chromeSession: {
                useVal: chromeSession
              }
            }
            this.session.set(session)
          }, (event) => {
            // TODO find better event names
            if (event === cast.ReceiverAvailability.AVAILABLE) {
              this.devices.val = true
            } else {
              this.devices.val = false
            }
          },
          cast.AutoJoinPolicy.TAB_AND_ORIGIN_SCOPED)
        cast.initialize(apiConfig, () => {
          this.thisReady.val = true
          this.emit('ready')
        }, (err) => {
          this.emit('error', {
            message: 'Init error',
            error: err
          })
        })
      } else {
        this.emit('error', errorInfo)
      }
    }
    document.getElementsByTagName('head')[0].appendChild(script)
  }
}

exports.define = {
  stopCasting () {
    var session = this.session
    if (session && session.chromeSession) {
      session.chromeSession.stop()
      session.set({
        val: false,
        id: false,
        chromeSession: null
      })
    }
  },
  startCasting () {
    var session = this.session
    chrome.cast.requestSession((chromeSession) => {
      // TODO do we need to override the session?
      session.val = true
      session.set({
        id: chromeSession.sessionId,
        val: {
          useVal: chromeSession
        }
      })
      session.chromeSession = chromeSession
    }, (err) => {
      this.emit('error', {
        message: 'Cast error',
        error: err
      })
    })
  }
}
