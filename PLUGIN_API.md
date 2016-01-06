### Plugin API

**Properties formats**
* `timezone` must be in the format YYYY-MM-DDThh:mm:ssZ (eg 1997-07-16T19:20:30+0100)
* `network` must be one of those strings: `none`, `2g`, `3g`, `4g` or `wifi`

**Emits**
* `init`, the plugin emits the appId and set the plugin as ready in the callback
* `startCasting`, emitted with the target deviceId and expects the casting to start
* `stopCasting`, no data is emitted, expects the cast to stop

**Listens**
* `deviceJoined`, expects the device informations sent as JSON object, eg: `{ id: 'deviceId', name: 'deviceName' }`
* `deviceLeft`, expects just the deviceId as String
