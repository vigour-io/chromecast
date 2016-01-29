package io.vigour.plugin.chromecast;

import android.content.Context;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.support.annotation.NonNull;
import android.support.v7.media.MediaRouteSelector;
import android.support.v7.media.MediaRouter;
import android.support.v7.media.MediaRouter.RouteInfo;
import android.util.Log;

import com.fasterxml.jackson.jr.ob.impl.DeferredMap;
import com.google.android.gms.cast.ApplicationMetadata;
import com.google.android.gms.cast.Cast;
import com.google.android.gms.cast.Cast.CastOptions;
import com.google.android.gms.cast.CastDevice;
import com.google.android.gms.cast.CastMediaControlIntent;
import com.google.android.gms.cast.CastStatusCodes;
import com.google.android.gms.common.ConnectionResult;
import com.google.android.gms.common.api.GoogleApiClient;
import com.google.android.gms.common.api.ResultCallback;
import com.google.android.gms.common.api.Status;

import java.lang.reflect.Field;
import java.util.HashMap;
import java.util.Map;

import io.vigour.nativewrapper.plugin.core.ActivityLifecycleListener;
import io.vigour.nativewrapper.plugin.core.BridgeEvents;
import io.vigour.nativewrapper.plugin.core.Plugin;
import rx.Observable;
import rx.Subscriber;
import rx.functions.Func1;

import static com.google.android.gms.cast.Cast.CastApi;

public class ChromecastPlugin extends Plugin implements ActivityLifecycleListener {
	private static final String NAME = "chromecast";
	private static final String TAG = ChromecastPlugin.class.getName();

	public static final String ERROR_UNKNOWN_DEVICE = "unknown device";
	public static final String ERROR_RECEIVER_APP_ERROR = "launching receiver app failed";
	public static final String ERROR_MISSING_ARGUMENT_DEVICEID = "missing argument: deviceId";

	public static final String EVENT_STOPPED_CASTING = "stoppedCasting";

	enum DeviceEvent {
		DEVICE_JOINED("deviceJoined"),
		DEVICE_LEFT("deviceLeft");

		private final String _event;

		DeviceEvent(@NonNull String event) {
			_event = event;
		}

		@Override
		public String toString() {
			return _event;
		}
	}

	enum PluginStatus {
		NEW,
		READY,
		PENDING_CONNECTION,
		LAUNCHING_APP,
		CASTING,
		STOPPED,
		SUSPENDED,
	}

	private final Context _context;
	private final Handler _mainHandler = new Handler(Looper.getMainLooper());
	private final Map<String, MediaRouter.RouteInfo> _activeRoutes = new HashMap<>();
	private final MediaRouter _mediaRouter;
	private MediaRouteSelector _mediaRouteSelector;
	private MediaRouter.Callback _mediaRouterCallback;
	private PluginStatus _status = PluginStatus.NEW;
	private boolean _isPendingCast = false;
	private GoogleApiClient _apiClient;
	private String _sessionId;
	private String _appId;

	public ChromecastPlugin(@NonNull final Context context) {
		super(NAME);
		_context = context.getApplicationContext();
		_mediaRouter = MediaRouter.getInstance(_context);
	}

	public Observable<Void> init(@NonNull final DeferredMap settings) {
		if (_status != PluginStatus.NEW) {
			return Observable.error(new IllegalStateException("init should only be called once"));
		}

		final String appId = (String) settings.get("appId");
		if ("default".equals(appId)) {
			_appId = CastMediaControlIntent.DEFAULT_MEDIA_RECEIVER_APPLICATION_ID;
		} else {
			_appId = appId;
		}

		_mediaRouteSelector = new MediaRouteSelector.Builder()
				.addControlCategory(CastMediaControlIntent.categoryForRemotePlayback(_appId))
				.build();

		_mediaRouterCallback = new MediaRouter.Callback() {
			@Override
			public void onRouteAdded(MediaRouter router, MediaRouter.RouteInfo route) {
				final String routeId = route.getId();

				if (!_activeRoutes.containsKey(routeId)) {
					_activeRoutes.put(routeId, route);
					sendDeviceEvent(DeviceEvent.DEVICE_JOINED, routeId, route.getName());
				}
			}

			@Override
			public void onRouteRemoved(MediaRouter router, MediaRouter.RouteInfo route) {
				final String routeId = route.getId();

				if (_activeRoutes.containsKey(routeId)) {
					_activeRoutes.remove(routeId);
					sendDeviceEvent(DeviceEvent.DEVICE_LEFT, routeId, route.getName());
				}
			}
		};

		return startListening();
	}

	private Observable<Void> stopListening() {
		if (null == _mediaRouterCallback) {
			return Observable.empty();
		}

		return Observable.create(new Observable.OnSubscribe<Void>() {
			@Override
			public void call(final Subscriber<? super Void> subscriber) {
				runOnUiThread(new Runnable() {
					@Override
					public void run() {
						_mediaRouter.removeCallback(_mediaRouterCallback);
						_mediaRouterCallback = null;

						subscriber.onNext(null);
					}
				});
			}
		});
	}

	private Observable<Void> startListening() {
		if (null == _mediaRouteSelector) {
			return Observable.empty();
		}

		return Observable.create(new Observable.OnSubscribe<Void>() {
			@Override
			public void call(final Subscriber<? super Void> subscriber) {
				runOnUiThread(new Runnable() {
					@Override
					public void run() {
						_mediaRouter.addCallback(_mediaRouteSelector, _mediaRouterCallback,
								MediaRouter.CALLBACK_FLAG_REQUEST_DISCOVERY);

						_status = PluginStatus.READY;

						subscriber.onNext(null);
					}
				});
			}
		});
	}

	private void runOnUiThread(final Runnable r) {
		_mainHandler.post(r);
	}

	private void connectChannels() {
		// TODO: reconnect after connection has ben lost and re-established
	}

	private void teardown() {
		if (_apiClient != null && _apiClient.isConnected() || _apiClient.isConnecting()) {
			//try {
				Cast.CastApi.stopApplication(_apiClient, _sessionId);
				/*
				if (mHelloWorldChannel != null) {
					Cast.CastApi.removeMessageReceivedCallbacks(
							mApiClient,
							mHelloWorldChannel.getNamespace());
					mHelloWorldChannel = null;
				}
			} catch (IOException e) {
				Log.e(TAG, "Exception while removing channel", e);
				sendError(e.getMessage());
			}
			*/
			_apiClient.disconnect();
			_apiClient = null;
		}

		_sessionId = null;
	}

	public Observable<Void> startCasting(@NonNull final DeferredMap arguments) {

		return Observable.create(new Observable.OnSubscribe<Void>() {
			@Override
			public void call(final Subscriber<? super Void> subscriber) {
				runOnUiThread(new Runnable() {
					@Override
					public void run() {
						if (!arguments.containsKey("deviceId")) {
							subscriber.onError(new IllegalArgumentException(ERROR_MISSING_ARGUMENT_DEVICEID));
							return;
						}

						final String deviceId = (String) arguments.get("deviceId");

						if (!_activeRoutes.containsKey(deviceId)) {
							subscriber.onError(new IllegalArgumentException(ERROR_UNKNOWN_DEVICE));
							return;
						}

						if (isCasting()) {
							stopCasting().flatMap(new Func1<Void, Observable<Void>>() {
								@Override
								public Observable<Void> call(Void aVoid) {
									return startCasting(arguments);
								}
							}).subscribe(subscriber);
							return;
						}

						for (final RouteInfo route : _mediaRouter.getRoutes()) {
							if (route.getId().equals(deviceId)) {
								connectApiClient(subscriber, route);
								return;
							}
						}

						subscriber.onError(new IllegalArgumentException(ERROR_UNKNOWN_DEVICE));
					}
				});
			}
		});
	}

	private void connectApiClient(@NonNull final Subscriber<? super Void> subscriber,
	                              @NonNull final RouteInfo route) {
		final CastDevice castDevice = CastDevice.getFromBundle(route.getExtras());
		if (null == castDevice) {
			subscriber.onError(new IllegalArgumentException(ERROR_UNKNOWN_DEVICE));
			return;
		}

		final Cast.Listener listener = new Cast.Listener() {
			@Override
			public void onApplicationDisconnected(int statusCode) {
				ChromecastPlugin.this.onApplicationDisconnected(statusCode);
			}

			@Override
			public void onApplicationStatusChanged() {
				ChromecastPlugin.this.onApplicationStatusChanged();
			}
		};

		final CastOptions apiOptions = new CastOptions.Builder(castDevice, listener).build();

		_apiClient = new GoogleApiClient.Builder(_context)
			.addApi(Cast.API, apiOptions)
			.addConnectionCallbacks(new GoogleApiClient.ConnectionCallbacks() {
				@Override
				public void onConnected(Bundle bundle) {
					launchApplication(subscriber);
				}

				@Override
				public void onConnectionSuspended(int i) {
					_status = PluginStatus.SUSPENDED;
					sendEvent(EVENT_STOPPED_CASTING, null);
				}
			})
			.addOnConnectionFailedListener(new GoogleApiClient.OnConnectionFailedListener() {
				@Override
				public void onConnectionFailed(@NonNull ConnectionResult connectionResult) {
					if (isCasting()) {
						sendEvent(EVENT_STOPPED_CASTING, null);
					}
					teardown();
				}
			})
			.build();

		_apiClient.connect();
		_status = PluginStatus.PENDING_CONNECTION;
	}

	private void launchApplication(@NonNull final Subscriber<? super Void> subscriber) {
		_status = PluginStatus.LAUNCHING_APP;
		try {
			CastApi.launchApplication(_apiClient, _appId)
					.setResultCallback(new ResultCallback<Cast.ApplicationConnectionResult>() {
						@Override
						public void onResult(@NonNull Cast.ApplicationConnectionResult result) {
							Status status = result.getStatus();
							if (status.isSuccess()) {

								//CastApi.setMessageReceivedCallbacks(_apiClient, );

								_sessionId = result.getSessionId();
								final String applicationStatus = result.getApplicationStatus();
								final ApplicationMetadata metadata = result.getApplicationMetadata();
								_status = PluginStatus.CASTING;
								subscriber.onNext(null);
							} else {
								subscriber.onError(new RuntimeException(ERROR_RECEIVER_APP_ERROR));

								_status = PluginStatus.READY;
								teardown();
							}
						}
					});
		} catch (Exception e) {
			Log.e(TAG, "Failed to launch application", e);
			subscriber.onError(e);
		}
	}

	private boolean isCasting() {
		if (null == _apiClient) {
			return false;
		}

		switch (_status) {
			case NEW:
			case READY:
			case STOPPED:
				return false;
		}

		return true;
	}

	public Observable<Void> stopCasting() {
		if (null == _apiClient) {
			return Observable.error(new IllegalStateException("app not casting"));
		}

		return Observable.create(new Observable.OnSubscribe<Void>() {
			@Override
			public void call(final Subscriber<? super Void> subscriber) {
				runOnUiThread(new Runnable() {
					@Override
					public void run() {
						_status = PluginStatus.STOPPED;
						teardown();
						sendEvent(EVENT_STOPPED_CASTING, null);
					}
				});
			}
		});
	}

	public void onApplicationDisconnected(int statusCode) {
		switch (statusCode) {
			case CastStatusCodes.NETWORK_ERROR:
				sendError("network error");
				break;

			case CastStatusCodes.TIMEOUT:
				sendError("timeout");
				break;

			case CastStatusCodes.INTERRUPTED:
				sendError("interrupted");
				break;

			case CastStatusCodes.AUTHENTICATION_FAILED:
				sendError("authentication failed");
				break;

			case CastStatusCodes.INVALID_REQUEST:
				sendError("invalid request");
				break;

			case CastStatusCodes.CANCELED:
				sendError("canceled");
				break;

			case CastStatusCodes.NOT_ALLOWED:
				sendError("not alllowed");
				break;

			case CastStatusCodes.APPLICATION_NOT_FOUND:
				sendError("application not found");
				break;

			case CastStatusCodes.APPLICATION_NOT_RUNNING:
				sendError("application not running");
				break;

			case CastStatusCodes.MESSAGE_TOO_LARGE:
				sendError("message too large");
				break;

			case CastStatusCodes.MESSAGE_SEND_BUFFER_TOO_FULL:
				sendError("message send buffer too full");
				break;

			case CastStatusCodes.FAILED:
				sendError("failed");
				break;

			case CastStatusCodes.REPLACED:
				sendError("replaced");
				break;

			case CastStatusCodes.INTERNAL_ERROR:
				sendError("internal error");
				break;

			case CastStatusCodes.UNKNOWN_ERROR:
				sendError("unknown error");
				break;

			case CastStatusCodes.ERROR_SERVICE_CREATION_FAILED:
				sendError("error service creation failed");
				break;

			case CastStatusCodes.ERROR_SERVICE_DISCONNECTED:
				sendError("error service disconnected");
				break;
		}
	}

	public void onApplicationStatusChanged() {
	}

	private void sendDeviceEvent(@NonNull DeviceEvent event, @NonNull String deviceId, @NonNull String deviceName) {
		final String result = String.format("{\"id\": \"%s\", \"name\":\"%s\"}", deviceId, deviceName);

		/*
		final Map<String, String> result = new HashMap<>();
		result.put("id", deviceId);
		result.put("name", deviceName);
		*/

		sendEvent(event.toString(), result);
	}

	@Override
	public void onStart() {
		startListening();
	}

	@Override
	public void onPause() {
	}

	@Override
	public void onResume() {

	}

	@Override
	public void onStop() {
		stopListening();
	}
}
