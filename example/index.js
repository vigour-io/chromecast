'use strict'
require('./style.less')

var chr = require('../lib')
var Element = require('vigour-element')
Element.prototype.inject(
  require('vigour-element/lib/property/css'),
  require('vigour-element/lib/property/text')
)

var TopBar = new Element({
  css: 'topbar',
  header: new Element({
    node: 'h2'
  })
}).Constructor

var InputGroup = new Element({
  css: 'input-group',
  label: new Element({
    node: 'span'
  }),
  input: new Element({
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
    validate: new Element({
      node: 'button',
      text: 'Validate',
      on: {
        click () {
          chr.val = app.config.appid.input.node.value
        }
      }
    }),
    reset: new Element({
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
