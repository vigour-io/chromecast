'use strict'
require('./style.less')

var chr = require('../lib')
chr.val = true
var Element = require('vigour-element')

Element.prototype.inject(
  require('vigour-element/lib/property/css'),
  require('vigour-element/lib/property/text')
)

var label = chr._platform.label.val
var app

if (label === 'web') { // ---------- example app for chrome browser
  app = new Element({
    node: document.body,
    topbar: {
      css: 'topbar',
      header: {
        node: 'h2',
        text: 'Chromecast testing app for ' + label
      }
    },
    available: {
      node: 'h3',
      label: {
        text: 'AVAILABLE'
      },
      yesno: {
        text: String(chr.available.val)
      }
    },
    session: {
      node: 'h3',
      label: {
        text: 'SESSION'
      },
      yesno: {
        text: String(chr.session.val)
      }
    },
    controls: {
      start: {
        node: 'button',
        text: 'Start casting',
        on: {
          click () {
            console.log('start casting!')
            chr.session.val = true
          }
        }
      },
      stop: {
        node: 'button',
        text: 'Stop casting',
        on: {
          click () {
            console.log('stop casting! chr.session.val?', chr.session.val)
            chr.session.val = false
          }
        }
      }
    }
  })
} else { // ---------- example app for native devices
  app = new Element({
    node: document.body,
    topbar: {
      css: 'topbar',
      header: {
        node: 'h2',
        text: 'Chromecast testing app for ' + label
      }
    },
    available: {
      node: 'h3',
      label: {
        text: 'AVAILABLE'
      },
      yesno: {
        text: String(chr.available.val)
      }
    },
    session: {
      node: 'h3',
      label: {
        text: 'SESSION'
      },
      yesno: {
        text: String(chr.session.val)
      }
    },
    controls: {
      stop: {
        node: 'button',
        text: 'Stop casting',
        on: {
          click () {
            console.log('stop casting! chr.session.val?', chr.session.val)
            chr.session.val = 0
          }
        }
      }
    },
    devices: {
      header: {
        node: 'h2',
        text: 'Devices'
      },
      devicelist: {}
    }
  })

  chr.devices.on('property', function (data) {
    console.log('DEVICES ON PROPERTY!!!', data)
    var added = data.added
    if (added) {
      for (let key of added) {
        let device = chr.devices[key]
        app.devices.devicelist.set({
          [key]: makeDeviceElement(device)
        })
      }
    }

    var removed = data.removed
    if (removed) {
      for (let key of removed) {
        let element = app.devices.devicelist[key]
        element.remove()
      }
    }
  })
}

chr.on('ready', () => {
  console.log('ready')
  console.log(chr.pluginReady.val)
})

chr.available.on('data', function (val) {
  app.available.yesno.text.val = String(val)
})

chr.session.on('data', function (val) {
  app.session.yesno.text.val = typeof val === 'object'
    ? val.serialize
      ? JSON.stringify(val.serialize())
      : JSON.stringify(val)
    : String(val)
})

chr.on('stopped-casting', () => {
  console.log('stopped-casting')
  console.log(arguments)
})
chr.on('started-casting', () => {
  console.log('started-casting')
  console.log(arguments)
})

chr.on('error', (err) => {
  console.log('error')
  console.log(err)
})

global.chr = chr
global.app = app

function makeDeviceElement (device) {
  var deviceid = device.id.val
  var devicename = device.name.val

  return {
    css: 'deviceelement',
    deviceid: {
      text: deviceid
    },
    devicename: {
      text: devicename
    },
    connector: {
      node: 'button',
      text: 'connect!',
      on: {
        click () {
          console.log('yay connect to', devicename)
          chr.session.val = device
        }
      }
    }
  }
}
