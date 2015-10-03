# plugin
- Fork this repo to make vigour-native plugins.

## To Do
- choose a `<plugin-name>` and use it in this readme, and in the package.json
- android:
  - rename folder native/android/plugin to make it easier to work Android Studio
  - set artifactId in native/android/src/lib/build.gradle to `<plugin-name>`
  - chaenge the package names in the android source
  - create lib functionality and make the android example work

## Install
Add `"plugin": "git+ssh://git@github.com:vigour-io/plugin.git#master"` to the dependencies in your app's pakage.json, then run `npm update plugin`
Coming soon: `npm i vigour-plugin`

## Updates via upstream remote
- `git remote add skeleton git@github.com:vigour-io/plugin.git`
- `git pull skeleton develop`

## Usage
See [tests](test)

## Building native apps
See [wrapper](http://github.com/vigour-io/vigour-native)
