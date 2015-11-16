# chromecast
Everything needed for Chromecast sender apps

## Install
Add `"chromecast": "git+ssh://git@github.com:vigour-io/chromecast.git#master"` to the dependencies in your app's pakage.json, then run `npm update chromecast`
Coming soon: `npm i vigour-chromecast`

## Updates via upstream remote

- `git remote add skeleton git@github.com:vigour-io/plugin.git`
- `git pull skeleton develop`

## Usage
Basic example

```js
var chr = require('chromecast')
var assert = require('assert')

// Init with appId
chr.val = 'appId'

// Plugin is not ready yet
assert.equal(chr.pluginReady.val, true)

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
chr.on('started-casting', () => {})
// Emitted when stopped casting on a session
chr.on('stopped-casting', () => {})
//// Devices listeners
// When a receiver (web) or a new device is available
chr.devices.on('value', (device /*passed just on native*/) => {})
//// Session listeners
// New session

```
See [tests](test)

## Building native apps
See [wrapper](http://github.com/vigour-io/vigour-native)
