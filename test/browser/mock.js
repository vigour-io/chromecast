'use strict'
exports.platform = {
  on: {
    init: {
      chromecast (done) {
        setTimeout(() => {
          this.parent.set({
            available: 1,
            ready: true
          })
          done()
        }, 10)
      }
    },
    connect: {
      chromecast (obj) {
        setTimeout(() => {
          this.parent.session.id.val = '1234'
          obj.done()
        }, 10)
      }
    },
    disconnect: {
      chromecast (done) {
        setTimeout(() => {
          this.parent.session.id.val = false
          done()
        }, 10)
      }
    }
  }
}
