## Android
To build the native library for android and release it follow these steps:
- make sure your `native/android/<plugin-name>/local.properties` or the `gradle.properties` in your home dir contain these settings:
```
bintray.user=vigour
bintray.apikey=<find the correct key somewhere>
```
- in `native/android/<plugin-name>/lib/build.gradle`:
  + bump version
  + check correctness of the values in the `ext`
- in `native/android/<plugin-name>` run `./gradlew install bintrayUpload`

If the output is `SUCCUSS` the new version will be available from jcenter
