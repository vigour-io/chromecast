[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://github.com/feross/standard)
[![npm version](https://badge.fury.io/js/vigour-chromecast.svg)](https://badge.fury.io/js/vigour-chromecast)
[![Build Status](https://travis-ci.org/vigour-io/chromecast.svg?branch=develop)](https://travis-ci.org/vigour-io/chromecast)

___

# Chromecase development

## Native Methods
Will be called using the bridge.send interface.

#### init({appId: 'theappid'})
Called to pass the appId at runtime. Implementation is optional.

##### callback expects (err)

#### startCasting({ deviceId: 'somedeviceid' })
Will be called to start casting to a device, telling the receiver with id `'adeviceid'` to start casting the app.

##### callback expects (err)

#### stopCasting()

Will be called to stop any session currently going on.

##### callback expects (err)

## Native Events
Should be fired from the native side, using bridge.receive interface.

#### deviceJoined 
- payload: device object: `{id: 'deviceid', name: 'devicename'}`

Should fire whenever a new receiver device becomes available

#### deviceLeft
- payload: device object: `{id: 'deviceid', name: 'devicename'}`

Should fire whenever a receiver device becomes unavailable

#### stoppedCasting
- payload: `none`

Should fire whenever a session is interrupted but not when
- stopCasting was called
- deviceLeft has been fired

So this is only to cover the edge case that a native interface detects a session has  stopped "out of nowhere".

___
