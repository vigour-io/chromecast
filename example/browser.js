'use strict'
require('./style.less')

var chr = require('../lib')
var Element = require('vigour-element')
var uikit = require('vigour-uikit')
Element.prototype.inject(
  require('vigour-element/lib/property/css'),
  require('vigour-element/lib/property/text')
)

var TopBar = new uikit.Topbar({
  css: 'topbar',
  header: new uikit.Header[2]()
}).Constructor

var InputGroup = new Element({
  css: 'input-group',
  label: new uikit.Label({
    node: 'span'
  }),
  input: new uikit.Input({
    node: 'input'
  })
}).Constructor

var app = new Element({
  node: document.body,
  topbar: new TopBar({
    header: {
      text: 'Client 01'
    }
  }),
  config: new Element({
    appid: new InputGroup({
      label: {
        text: {
          val: 'AppId'
        }
      }
    })
  }),
  controls: {
    validate: new uikit.Button({
      node: 'button',
      text: 'Validate',
      on: {
        click () {
          chr.val = app.config.appid.input.node.value
        }
      }
    }),
    reset: new uikit.Button({
      node: 'button',
      text: 'Reset',
      on: {
        click () {
          app.config.appid.input.node.value = ''
        }
      }
    })
  }
})

chr.on('ready', () => {
  console.log('ready')
  console.log(chr.pluginReady.val)
})
chr.devices.on('value', () => {
  console.log('devices')
  console.log(arguments)
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
