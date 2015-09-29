# plugin

##Create
- Fork this repo to make vigour-native plugins.
- choose a <plugin-name>
- android:
  - set artifactId in native/android/src/lib/build.gradle to <plugin-name>
  - create lib functionality and make the android example work

##Install
Add `"<plugin-name>": "git+ssh://git@github.com:vigour-io/<plugin-name>.git#master"` to the dependencies in your app's pakage.json, then run `npm update <plugin-name>`
Coming soon: `npm i vigour-plugin`

## Updates via upstream remote
- `git remote add skeleton git@github.com:vigour-io/plugin.git`
- `git pull skeleton develop`

## Usage
See [tests](test)

## Building native apps
See [wrapper](http://github.com/vigour-io/vigour-native)
