package io.vigour.plugin.chromecast;

import android.app.Activity;
import android.content.SharedPreferences;
import android.support.v7.media.MediaRouteSelector;
import android.support.v7.media.MediaRouter;
import android.util.Log;

import com.google.android.gms.cast.CastMediaControlIntent;

import org.json.JSONObject;

import io.vigour.nativewrapper.plugin.core.Plugin;

public class Chromecast extends Plugin implements ChromecastOnSessionUpdatedListener {

    private static final String SETTINGS_NAME = "CordovaChromecastSettings";
    private final Activity activity;

    private MediaRouter mediaRouter;
    private MediaRouteSelector mediaRouteSelector;
//    private volatile MediaRouter mMediaRouterCallback = new ChromecastMediaRouterCallback();
    private String appId;

    private boolean autoConnect = false;
    private String lastSessionId = null;
    private String lastAppId = null;

    private SharedPreferences settings;


    private volatile ChromecastSession currentSession;

    public Chromecast(Activity activity) {
        super("chromecast");
        this.activity = activity;
    }

    /**
     * Initialize all of the MediaRouter stuff with the AppId
     * For now, ignore the autoJoinPolicy and defaultActionPolicy; those will come later
     *
     * @param appId               The appId we're going to use for ALL session requests
     * @param autoJoinPolicy      tab_and_origin_scoped | origin_scoped | page_scoped
     * @param defaultActionPolicy create_session | cast_this_tab
     */
    public String init(final String appId, String autoJoinPolicy, String defaultActionPolicy) {
        this.settings = activity.getSharedPreferences(SETTINGS_NAME, 0);
        this.lastSessionId = settings.getString("lastSessionId", "");
        this.lastAppId = settings.getString("lastAppId", "");

        log("initialize " + autoJoinPolicy + " " + appId + " " + this.lastAppId);
        if (autoJoinPolicy.equals("origin_scoped") && appId.equals(this.lastAppId)) {
            log("lastAppId " + lastAppId);
            autoConnect = true;
        } else if (autoJoinPolicy.equals("origin_scoped")) {
            log("setting lastAppId " + lastAppId);
            this.settings.edit().putString("lastAppId", appId).apply();
        }

        mediaRouter = MediaRouter.getInstance(activity);
        mediaRouteSelector = new MediaRouteSelector.Builder()
                .addControlCategory(CastMediaControlIntent.categoryForCast(appId))
                .build();

//        mMediaRouterCallback.registerCallbacks(this);
        MediaRouter.Callback callback = new MediaRouter.Callback() {
            @Override
            public void onProviderAdded(MediaRouter router, MediaRouter.ProviderInfo provider) {
                super.onProviderAdded(router, provider);
            }
        };
        mediaRouter.addCallback(mediaRouteSelector, callback, MediaRouter.CALLBACK_FLAG_PERFORM_ACTIVE_SCAN);

//        checkReceiverAvailable();
//        emitAllRoutes(null);

        return "";
    }


    private void log(String s) {
        Log.d("chromecast", s);
    }


    public void onDestroy() {

        if (this.currentSession != null) {
//    		this.currentSession.kill(new ChromecastSessionCallback() {
//				void onSuccess(Object object) {	}
//				void onError(String reason) {}
//    		});
        }
    }

    private void setLastSessionId(String sessionId) {
        this.lastSessionId = sessionId;
        this.settings.edit().putString("lastSessionId", sessionId).apply();
    }


    /* *
     * Request the session for the previously sent appId
     * THIS IS WHAT LAUNCHES THE CHROMECAST PICKER
     * NOTE: Make a request session that is automatic - it'll do most of this code - refactor will be required
     *
     * /
    public String requestSession() {
        if (this.currentSession != null) {
            return currentSession.createSessionObject().toString();
        }

        this.setLastSessionId("");

                mediaRouter = MediaRouter.getInstance(activity.getApplicationContext());
                final List<RouteInfo> routeList = mediaRouter.getRoutes();

                AlertDialog.Builder builder = new AlertDialog.Builder(activity);
                builder.setTitle("Choose a Chromecast");
                //CharSequence[] seq = new CharSequence[routeList.size() -1];
                ArrayList<String> seq_tmp1 = new ArrayList<String>();

                final ArrayList<Integer> seq_tmp_cnt_final = new ArrayList<Integer>();

                for (int n = 1; n < routeList.size(); n++) {
                    RouteInfo route = routeList.get(n);
                    if (!route.getName().equals("Phone") && route.getId().indexOf("Cast") > -1) {
                        seq_tmp1.add(route.getName());
                        seq_tmp_cnt_final.add(n);
                        //seq[n-1] = route.getName();
                    }
                }

                CharSequence[] seq;
                seq = seq_tmp1.toArray(new CharSequence[seq_tmp1.size()]);

                builder.setNegativeButton("cancel", new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface dialog, int which) {
                        dialog.dismiss();
                        // "cancel";
                    }
                });

                builder.setItems(seq, new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface dialog, int which) {
                        which = seq_tmp_cnt_final.get(which);
                        RouteInfo selectedRoute = routeList.get(which);
                        //RouteInfo selectedRoute = routeList.get(which + 1);
                        Chromecast.this.createSession(selectedRoute);
                    }
                });

                builder.show();


        return "";
    }


    /**
     * Selects a route by its id
     *
     * @param routeId
     * @return
     * /
    public boolean selectRoute(final String routeId) {
        if (this.currentSession != null) {
            callbackContext.success(this.currentSession.createSessionObject());
            return true;
        }

        this.setLastSessionId("");

        final Activity activity = cordova.getActivity();
        activity.runOnUiThread(new Runnable() {
            public void run() {
                mediaRouter = MediaRouter.getInstance(activity.getApplicationContext());
                final List<RouteInfo> routeList = mediaRouter.getRoutes();

                for (RouteInfo route : routeList) {
                    if (route.getId().equals(routeId)) {
                        Chromecast.this.createSession(route, callbackContext);
                        return;
                    }
                }

                callbackContext.error("No route found");

            }
        });

        return true;
    }

    /**
     * Helper for the creating of a session! The user-selected RouteInfo needs to be passed to a new ChromecastSession
     *
     * @param routeInfo
     * @param callbackContext
     * /
    private void createSession(RouteInfo routeInfo) {
        this.currentSession = new ChromecastSession(routeInfo, this.cordova, this, this);

        // Launch the app.
        this.currentSession.launch(this.appId, new ChromecastSessionCallback() {

            @Override void onSuccess(Object object) {
                ChromecastSession session = (ChromecastSession) object;
                if (object == null) {
                    onError("unknown");
                } else if (session == Chromecast.this.currentSession) {
                    Chromecast.this.setLastSessionId(Chromecast.this.currentSession.getSessionId());

                    if (callbackContext != null) {
                        callbackContext.success(session.createSessionObject());
                    } else {
                        sendJavascript("chrome.cast._.sessionJoined(" + Chromecast.this.currentSession.createSessionObject().toString() + ");");
                    }
                }
            }

            @Override void onError(String reason) {
                if (reason != null) {
                    Chromecast.this.log("createSession onError " + reason);
                    if (callbackContext != null) {
                        callbackContext.error(reason);
                    }
                } else {
                    if (callbackContext != null) {
                        callbackContext.error("unknown");
                    }
                }
            }

        });
    }

    private void joinSession(RouteInfo routeInfo) {
        ChromecastSession sessionJoinAttempt = new ChromecastSession(routeInfo, this.cordova, this, this);
        sessionJoinAttempt.join(this.appId, this.lastSessionId, new ChromecastSessionCallback() {

            @Override void onSuccess(Object object) {
                if (Chromecast.this.currentSession == null) {
                    try {
                        Chromecast.this.currentSession = (ChromecastSession) object;
                        Chromecast.this.setLastSessionId(Chromecast.this.currentSession.getSessionId());
                        sendJavascript("chrome.cast._.sessionJoined(" + Chromecast.this.currentSession.createSessionObject().toString() + ");");
                    } catch (Exception e) {
                        log("wut.... " + e.getMessage() + e.getStackTrace());
                    }
                }
            }

            @Override void onError(String reason) {
                log("sessionJoinAttempt error " + reason);
            }

        });
    }

    /**
     * Set the volume level on the receiver - this is a Chromecast volume, not a Media volume
     *
     * @param newLevel
     * /
    public boolean setReceiverVolumeLevel(Double newLevel) {
        if (this.currentSession != null) {
            this.currentSession.setVolume(newLevel);
        } else {
            sendError("session_error");
        }
        return true;
    }

    public boolean setReceiverVolumeLevel(Integer newLevel) {
        return this.setReceiverVolumeLevel(newLevel.doubleValue());
    }

    /**
     * Sets the muted boolean on the receiver - this is a Chromecast mute, not a Media mute
     *
     * @param muted
     * /
    public boolean setReceiverMuted(Boolean muted) {
        if (this.currentSession != null) {
            this.currentSession.setMute(muted, genericCallback());
        } else {
            sendError("session_error");
        }
        return true;
    }

    /**
     * Stop the session! Disconnect! All of that jazz!
     * /
    public boolean stopSession() {
        sendError("not_implemented");
        return true;
    }


    /**
     * Adds a listener to a specific namespace
     *
     * @param namespace
     * @return
     * /
    public boolean addMessageListener(String namespace) {
        if (this.currentSession != null) {
            this.currentSession.addMessageListener(namespace);
            sendEvent("success", "");
        }
        return true;
    }

    /**
     * Loads some media on the Chromecast using the media APIs
     *
     * @param contentId               The URL of the media item
     * @param contentType             MIME type of the content
     * @param duration                Duration of the content
     * @param streamType              buffered | live | other
     * @param callbackContext
     * /
    public boolean loadMedia(String contentId, String contentType, Integer duration, String streamType, Boolean autoPlay, Double currentTime, JSONObject metadata, final CallbackContext callbackContext) {

        if (this.currentSession != null) {
            return this.currentSession.loadMedia(contentId, contentType, duration, streamType, autoPlay, currentTime, metadata,
                                                 new ChromecastSessionCallback() {

                                                     @Override void onSuccess(Object object) {
                                                         if (object == null) {
                                                             onError("unknown");
                                                         } else {
                                                             sendEvent("success", "");

                                                         }
                                                     }

                                                     @Override void onError(String reason) {
                                                         sendError(reason);
                                                     }

                                                 });
        } else {
            sendError("session_error");
            return false;
        }
    }

    public boolean loadMedia(String contentId, String contentType, Integer duration, String streamType, Boolean autoPlay, Integer currentTime, JSONObject metadata, final CallbackContext callbackContext) {
        return this.loadMedia(contentId, contentType, duration, streamType, autoPlay, new Double(currentTime.doubleValue()), metadata, callbackContext);
    }

    /**
     * Play on the current media in the current session
     *
     * @param callbackContext
     * @return
     * /
    public boolean mediaPlay() {
        if (currentSession != null) {
            currentSession.mediaPlay(genericCallback());
        } else {
            sendError("session_error");
        }
        return true;
    }

    /**
     * Pause on the current media in the current session
     *
     * @return
     * /
    public boolean mediaPause() {
        if (currentSession != null) {
            currentSession.mediaPause(genericCallback());
        } else {
            sendError("session_error");
        }
        return true;
    }


    /**
     * Seeks the current media in the current session
     *
     * @param seekTime
     * @param resumeState
     * @param callbackContext
     * @return
     * /
    public boolean mediaSeek(Integer seekTime, String resumeState) {
        if (currentSession != null) {
            currentSession.mediaSeek(seekTime.longValue() * 1000, resumeState, genericCallback());
        } else {
            sendError("session_error");
        }
        return true;
    }


    public boolean setMediaVolume(Double level, CallbackContext callbackContext) {
        if (currentSession != null) {
            currentSession.mediaSetVolume(level, genericCallback(callbackContext));
        } else {
            callbackContext.error("session_error");
        }

        return true;
    }

    public boolean setMediaMuted(Boolean muted) {
        if (currentSession != null) {
            currentSession.mediaSetMuted(muted, genericCallback());
        } else {
            sendError("session_error");
        }

        return true;
    }

    public boolean mediaStop() {
        if (currentSession != null) {
            currentSession.mediaStop(genericCallback());
        } else {
            sendError("session_error");
        }

        return true;
    }

    public boolean sessionStop(CallbackContext callbackContext) {
        if (this.currentSession != null) {
            this.currentSession.kill(genericCallback(callbackContext));
            this.currentSession = null;
            this.setLastSessionId("");
        } else {
            callbackContext.success();
        }

        return true;
    }

    public boolean sessionLeave(CallbackContext callbackContext) {
        if (this.currentSession != null) {
            this.currentSession.leave(genericCallback(callbackContext));
            this.currentSession = null;
            this.setLastSessionId("");
        } else {
            callbackContext.success();
        }

        return true;
    }

    public boolean emitAllRoutes(CallbackContext callbackContext) {
        final Activity activity = cordova.getActivity();

        activity.runOnUiThread(new Runnable() {
            public void run() {
                mediaRouter = MediaRouter.getInstance(activity.getApplicationContext());
                List<RouteInfo> routeList = mediaRouter.getRoutes();

                for (RouteInfo route : routeList) {
                    if (!route.getName().equals("Phone") && route.getId().indexOf("Cast") > -1) {
                        sendJavascript("chrome.cast._.routeAdded(" + routeToJSON(route) + ")");
                    }
                }
            }
        });

        if (callbackContext != null) {
            callbackContext.success();
        }

        return true;
    }

    /**
     * Checks to see how many receivers are available - emits the receiver status down to Javascript
     * /
    private void checkReceiverAvailable() {
        final Activity activity = cordova.getActivity();

        activity.runOnUiThread(new Runnable() {
            public void run() {
                mediaRouter = MediaRouter.getInstance(activity.getApplicationContext());
                List<RouteInfo> routeList = mediaRouter.getRoutes();
                boolean available = false;

                for (RouteInfo route : routeList) {
                    if (!route.getName().equals("Phone") && route.getId().indexOf("Cast") > -1) {
                        available = true;
                        break;
                    }
                }
                if (available || (Chromecast.this.currentSession != null && Chromecast.this.currentSession.isConnected())) {
                    sendJavascript("chrome.cast._.receiverAvailable()");
                } else {
                    sendJavascript("chrome.cast._.receiverUnavailable()");
                }
            }
        });
    }

//    private ChromecastSessionCallback genericCallback(final CallbackContext callbackContext) {
//        return new ChromecastSessionCallback() {
//
//            @Override
//            public void onSuccess(Object object) {
//                callbackContext.success();
//            }
//
//            @Override
//            public void onError(String reason) {
//                callbackContext.error(reason);
//            }
//
//        };
//    }

    ;

    protected void onRouteAdded(MediaRouter router, final RouteInfo route) {
        if (this.autoConnect && this.currentSession == null && !route.getName().equals("Phone")) {
            log("Attempting to join route " + route.getName());
            this.joinSession(route);
        } else {
            log("For some reason, not attempting to join route " + route.getName() + ", " + this.currentSession + ", " + this.autoConnect);
        }
        if (!route.getName().equals("Phone") && route.getId().indexOf("Cast") > -1) {
            sendJavascript("chrome.cast._.routeAdded(" + routeToJSON(route) + ")");
        }
        this.checkReceiverAvailable();
    }

    protected void onRouteRemoved(MediaRouter router, RouteInfo route) {
        this.checkReceiverAvailable();
        if (!route.getName().equals("Phone") && route.getId().indexOf("Cast") > -1) {
            sendJavascript("chrome.cast._.routeRemoved(" + routeToJSON(route) + ")");
        }
    }

    protected void onRouteSelected(MediaRouter router, RouteInfo route) {
        this.createSession(route);
    }

    protected void onRouteUnselected(MediaRouter router, RouteInfo route) {
    }

    private JSONObject routeToJSON(RouteInfo route) {
        JSONObject obj = new JSONObject();

        try {
            obj.put("name", route.getName());
            obj.put("id", route.getId());
        } catch (JSONException e) {
            e.printStackTrace();
        }

        return obj;
    }

    public void onMediaUpdated(boolean isAlive, JSONObject media) {
        if (isAlive) {
            sendJavascript("chrome.cast._.mediaUpdated(true, " + media.toString() + ");");
        } else {
            sendJavascript("chrome.cast._.mediaUpdated(false, " + media.toString() + ");");
        }
    }
*/
    @Override
    public void onSessionUpdated(boolean isAlive, JSONObject session) {
        if (isAlive) {
            sendEvent("bla", "chrome.cast._.sessionUpdated(true, " + session.toString() + ");");
        } else {
            log("SESSION DESTROYYYY");
            sendEvent("bla", "chrome.cast._.sessionUpdated(false, " + session.toString() + ");");
            this.currentSession = null;
        }
    }


    @Override
    public void onMessage(ChromecastSession session, String namespace, String message) {
        sendEvent("bla", "chrome.cast._.onMessage('" + session.getSessionId() + "', '" + namespace + "', '" + message + "')");
    }

/*
    public void onMediaLoaded(JSONObject media) {
        sendJavascript("chrome.cast._.mediaLoaded(true, " + media.toString() + ");");
    }
    //Change all @deprecated this.webView.sendJavascript(String) to this local function sendJavascript(String)
    @TargetApi(Build.VERSION_CODES.KITKAT)
    private void sendJavascript(final String javascript) {

    }
    */
}
