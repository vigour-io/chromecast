'use strict'
// TODO move this to the package / config
const SCRIPT_SRC = 'https://www.gstatic.com/cv/js/sender/v1/cast_sender.js'
const SCRIPT_ID = 'chromecast-script'
const ERROR = 'error'

exports.platform = {
  on: {
    init: {
      chromecast (done) {
        var plugin = this.parent
        var script = document.createElement('script')
        script.onerror = () => {
          this.emit(ERROR, 'Chromecast script load error')
        }
        script.src = SCRIPT_SRC
        script.id = SCRIPT_ID
        window.__onGCastApiAvailable = (loaded, error) => {
          if (loaded) {
            var cast = window.chrome.cast
            var appID = plugin.appID
            if (appID === 'default') {
              appID = plugin.appID = cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID
            }
            cast.initialize(new cast.ApiConfig(
              // request settings
              new cast.SessionRequest(
                appID, [
                  cast.Capability.VIDEO_OUT,
                  cast.Capability.AUDIO_OUT
                ],
                cast.timeout.requestSession),
              // session listener
              (session) => {
                plugin.session.id.val = session.sessionId
                plugin.session.handle = session
              },
              // event listener
              (event) => {
                plugin.available.val = event === cast.ReceiverAvailability.AVAILABLE || 0
              },
              cast.AutoJoinPolicy.TAB_AND_ORIGIN_SCOPED
            ), () => {
              plugin.set({
                val: true,
                ready: true
              })
              if (done) {
                done()
              }
            }, (err) => {
              this.emit(ERROR, err)
              if (done) {
                done(true)
              }
            })
          } else {
            this.emit(ERROR, error)
            if (done) {
              done(true)
            }
          }
        }
        document.getElementsByTagName('head')[0].appendChild(script)
      }
    },
    connect: {
      chromecast (obj) {
        var plugin = this.parent
        window.chrome.cast.requestSession((session) => {
          plugin.session.id.val = session.sessionId
          plugin.session.handle = session
          obj.done()
        }, (err) => {
          plugin.emit(ERROR, err)
          obj.done(true)
        })
      }
    },
    disconnect: {
      chromecast (done) {
        var session = this.parent.session
        var sessionHandle = session.handle
        session.id.val = false
        if (sessionHandle) {
          sessionHandle.stop()
          delete session.handle
        }
        done()
      }
    }
  }
}
