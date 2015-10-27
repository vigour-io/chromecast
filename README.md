# plugin

Fork this repo to make vigour-native plugins.


### Creating plugins from this skeleton

- Fork this repository
- Choose a name (`<plugin-name>`) for your new plugin
- In this README
  + Use `<plugin-name>`
    * for the title
    * in the install section
  + Change the description
  + Remove this section
- In [package.json](package.json)
  + Use `<plugin-name>` in the following fields
    * name
    * repository.url
    * bugs.url
    * homepage
    * vigour.plugin.android.className
    * vigour.plugin.android.instantiation
  + Update the following fields
    * description
    * keywords
    * author
    * contributors
- In the `native` directory
  + Rename `native/android/plugin`
  + Update values in `native/android/<plugin-name>/lib/build.gradle`
  + Change the package names in the android source
  + Change the package in the libs AndroidManifest.xml
  + Create lib functionality and make the android example work
  + publish the android lib to jcenter, see [instructions](CONTRIBUTING.md)


## Install
- Add `"plugin": "git+ssh://git@github.com:vigour-io/plugin.git#master"` to the dependencies in [pakage.json](pakage.json)
- Run `npm update plugin`
- *Coming soon*: `npm i vigour-plugin`

## Updates via upstream remote
- `git remote add skeleton git@github.com:vigour-io/plugin.git`
- `git pull skeleton develop`

## Usage
See [tests](test)

## Building native apps
See [wrapper](http://github.com/vigour-io/vigour-native)
