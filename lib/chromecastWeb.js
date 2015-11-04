
var CAST_API_INITIALIZATION_DELAY = 1000
var MEDIA_SOURCE = ""
var APP_ID = ""
var currentMediaSession = null

function vigourChromeCast (appId) {
    APP_ID = appId
  if (!chrome.cast || !chrome.cast.isAvailable) {
    setTimeout(initializeCastApi, CAST_API_INITIALIZATION_DELAY)
  }
}

vigourChromeCast.prototype.stopVideo = function() {
  currentMediaSession.stop()
}

vigourChromeCast.prototype.stopSession = function() {
  if(session){
    session.stop()
  }
}

vigourChromeCast.prototype.castApp = function (media) {
  console.log('launching app...')
  chrome.cast.requestSession(onRequestSessionSuccess, onLaunchError)
  MEDIA_SOURCE = media
}

/**
 * initialization
 */
function initializeCastApi(onInitSuccess, onError) {
  var sessionRequest = new chrome.cast.SessionRequest(APP_ID)
  var apiConfig = new chrome.cast.ApiConfig(sessionRequest, sessionListener, receiverListener, chrome.cast.AutoJoinPolicy.TAB_AND_ORIGIN_SCOPED)
  chrome.cast.initialize(apiConfig, onInitSuccess, onError)
}

function onInitSuccess() {
  console.log("initialized")
}

function onError(e) {
  console.log('Error' + e)
}

function sessionListener(e) {
  console.log('New session ID: ' + e.sessionId)
  session = e
  if (session.media.length != 0) {
    onMediaDiscovered('sessionListener', session.media[0])
  }
  session.addMediaListener(onMediaDiscovered.bind(this, 'addMediaListener'))
  session.addUpdateListener(sessionUpdateListener.bind(this))
}

function receiverListener(e) {
  console.log("Testing")
  if (e === 'available') {
    console.log('receiver found')
  }
  else {
    console.log('receiver list empty')
  }
}

function onRequestSessionSuccess(e) {
  session = e
  session.addUpdateListener(sessionUpdateListener.bind(this))
  if (session.media.length != 0) {
    onMediaDiscovered('onRequestSession', session.media[0])
  }
  session.addMediaListener( onMediaDiscovered.bind(this, 'addMediaListener') )

  loadMedia()

  playMedia()
}


function loadMedia (mediaURL) {
  var mediaInfo = new chrome.cast.media.MediaInfo(MEDIA_SOURCE)
  mediaInfo.metadata = new chrome.cast.media.GenericMediaMetadata()
  mediaInfo.metadata.metadataType = chrome.cast.media.MetadataType.GENERIC
  mediaInfo.contentType = 'video/webm'
  mediaInfo.metadata.title = "Vigour test"

  var request = new chrome.cast.media.LoadRequest(mediaInfo)
  request.autoplay = true
  request.currentTime = 0

  session.loadMedia(request, onMediaDiscovered.bind(this, 'loadMedia'), onMediaError)
}

/**
 * callback on launch error
 */
function onLaunchError() {
  console.log('launch error', arguments)
}

/**
 * session update listener
 */
function sessionUpdateListener(isAlive) {
  if (!isAlive) {
    session = null
  }
}

/**
 * callback on success for loading media
 */
function onMediaDiscovered(how, mediaSession) {
  currentMediaSession = mediaSession
  mediaCurrentTime = currentMediaSession.currentTime
}

function playMedia() {
  if (currentMediaSession) {
    currentMediaSession.play(null, mediaCommandSuccessCallback.bind(this, 'playing started for ' + currentMediaSession.sessionId), onError)
  }
}

/**
 * callback on media loading error
 */
function onMediaError(e) {
  console.log('media error', e)
}

module.exports = vigourChromeCast
