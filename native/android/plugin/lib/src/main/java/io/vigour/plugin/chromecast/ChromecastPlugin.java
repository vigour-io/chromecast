package io.vigour.plugin.chromecast;

import android.content.Context;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.support.annotation.NonNull;
import android.support.v7.media.MediaControlIntent;
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

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import io.vigour.nativewrapper.plugin.core.ActivityLifecycleListener;
import io.vigour.nativewrapper.plugin.core.Plugin;
import rx.Observable;
import rx.Subscriber;

import static com.google.android.gms.cast.Cast.CastApi;

public class ChromecastPlugin extends Plugin implements ActivityLifecycleListener {
	private static final String NAME = "chromecast";
	private static final String TAG = ChromecastPlugin.class.getName();

	public static final String ERROR_UNKNOWN_DEVICE = "unknown device";
	public static final String ERROR_ALREADY_CASTING = "already casting to a device";
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

		_appId = (String) settings.get("appId");
		final String category;
		if ("default".equals(_appId)) {
			category = CastMediaControlIntent.categoryForRemotePlayback();
		} else {
			category = CastMediaControlIntent.categoryForRemotePlayback(_appId);
		}

		_mediaRouteSelector = new MediaRouteSelector.Builder()
				.addControlCategory(category)
				.addControlCategory(MediaControlIntent.CATEGORY_LIVE_VIDEO)
				.build();

		_mediaRouterCallback = new MediaRouter.Callback() {
			@Override
			public void onRouteAdded(MediaRouter router, MediaRouter.RouteInfo route) {
				ChromecastPlugin.this.onRouteAdded(route);
			}

			@Override
			public void onRouteRemoved(MediaRouter router, MediaRouter.RouteInfo route) {
				ChromecastPlugin.this.onRouteRemoved(route);
			}

			//TODO: check with marcus on how to handle route changes
			/*
			@Override
			public void onRouteChanged(MediaRouter router, MediaRouter.RouteInfo route) {
				_plugin.sendDeviceEvent(DeviceEvent.DEVICE_JOINED, route.getId(), route.getName());
				_plugin.sendDeviceEvent(DeviceEvent.DEVICE_LEFT, route.getId(), route.getName());
			}
			*/
		};

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
		if (null != _apiClient) {
			_apiClient.disconnect();
			_apiClient = null;
		}
	}

	public Observable<Void> startCasting(@NonNull final String deviceId) {
		if (!_activeRoutes.containsKey(deviceId)) {
			return Observable.error(new IllegalArgumentException(ERROR_UNKNOWN_DEVICE));
		}

		if (isCasting()) {
			return Observable.error(new IllegalStateException(ERROR_ALREADY_CASTING));
		}

		for (final RouteInfo route : _mediaRouter.getRoutes()) {
			if (route.getId().equals(deviceId)) {
				return connectApiClient(route);
			}
		}

		return Observable.error(new IllegalArgumentException(ERROR_UNKNOWN_DEVICE));
	}

	private Observable<Void> connectApiClient(@NonNull final RouteInfo route) {
		final CastDevice castDevice = CastDevice.getFromBundle(route.getExtras());
		if (null == castDevice) {
			return Observable.error(new IllegalArgumentException(ERROR_UNKNOWN_DEVICE));
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
					if (PluginStatus.SUSPENDED == _status) {
						connectChannels();
					} else {
						launchApplication();
					}
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
		return null;
	}

	private void launchApplication() {
		_status = PluginStatus.LAUNCHING_APP;
		try {
			CastApi.launchApplication(_apiClient, _appId)
					.setResultCallback(new ResultCallback<Cast.ApplicationConnectionResult>() {
						@Override
						public void onResult(@NonNull Cast.ApplicationConnectionResult result) {
							Status status = result.getStatus();
							if (status.isSuccess()) {
								_status = PluginStatus.CASTING;

								/*
								ApplicationMetadata applicationMetadata =
										result.getApplicationMetadata();
								String sessionId = result.getSessionId();
								String applicationStatus = result.getApplicationStatus();
								boolean wasLaunched = result.getWasLaunched();
								*/
							} else {
								_status = PluginStatus.READY;
								teardown();
							}
						}
					});
		} catch (Exception e) {
			Log.e(TAG, "Failed to launch application", e);
			throw e;
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

	public void stopCasting() {
		if (null == _apiClient) {
			throw new IllegalStateException("app not casting");
		}

		_status = PluginStatus.STOPPED;
		teardown();
	}

	public void onRouteAdded(@NonNull final MediaRouter.RouteInfo route) {
		final String routeId = route.getId();

		if (!_activeRoutes.containsKey(routeId)) {
			_activeRoutes.put(routeId, route);
			sendDeviceEvent(DeviceEvent.DEVICE_JOINED, routeId, route.getName());
		}
	}

	public void onRouteRemoved(@NonNull final MediaRouter.RouteInfo route) {
		final String routeId = route.getId();

		if (_activeRoutes.containsKey(routeId)) {
			_activeRoutes.remove(routeId);
			sendDeviceEvent(DeviceEvent.DEVICE_LEFT, routeId, route.getName());
		}
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
		final String json = String.format("{\"id\":\"%s\", \"name\": \"%s\"}", deviceId, deviceName);
		sendEvent(event.toString(), json);
	}

	@Override
	public void onStart() {
	}

	@Override
	public void onPause() {
	}

	@Override
	public void onResume() {
	}

	@Override
	public void onStop() {
		if (null != _mediaRouterCallback) {
			_mediaRouter.removeCallback(_mediaRouterCallback);
			_mediaRouterCallback = null;
		}
	}
}
