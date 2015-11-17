# chromecast
Everything needed for Chromecast sender apps

## Install
`npm i vigour-chromecast`

## Updates via upstream remote
- `git remote add skeleton git@github.com:vigour-io/plugin.git`
- `git pull skeleton develop`

## Try it out
- `npm run ios`
- `npm run android`
- `npm run all`

## Usage
Basic example

```js
var chr = require('chromecast')
var assert = require('assert')

// Init with appId
chr.val = 'appId'

// Plugin is not ready yet
assert.equal(chr.pluginReady.val, false)

// Start casting (for specific device if native)
var device = plugin.devices[deviceId]
chr.startCasting(device) // chr.startCasting()

// Stop casting for current session
chr.stopcasting()

//////
// Listening to events
//////
// Emitted on error
chr.on('error', (err) => {})
// Plugin init finished
chr.on('ready', () => {
  // plugin is now ready
  assert.equal(chr.pluginReady.val, true)
})
// Emitted when started casting on a session
chr.on('startedCasting', () => {
  // web
  assert.equal(chr.session.val, true)
  // native
  assert.equal(chr.session.val, device)
  // both
  assert.ok(chr.session.id)
})
// Emitted when stopped casting on a session
chr.on('stoppedCasting', () => {
  // web && native
  assert.equal(chr.session.val, false)
  assert.equal(chr.session.id, false)
})
//// Devices listeners
// When a receiver (web) or a new device is available
chr.devices.on('value', (data) => {
  // Emitted when a new device is there, can be a device ref for native or a boolean for web
})
//// Session listeners
// New session available
chr.session.on('value')
chr.session.id.on('value')
```

For more detailed usage look at the [tests](test)

## Building native apps
See [wrapper](http://github.com/vigour-io/vigour-native)
