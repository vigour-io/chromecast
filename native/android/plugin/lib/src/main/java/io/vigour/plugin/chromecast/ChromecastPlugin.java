package io.vigour.plugin.chromecast;

import android.content.Context;
import android.os.Bundle;
import android.support.annotation.NonNull;
import android.support.v7.media.MediaRouteSelector;
import android.support.v7.media.MediaRouter;
import android.support.v7.media.RemotePlaybackClient;

import com.fasterxml.jackson.jr.ob.impl.DeferredMap;
import com.google.android.gms.cast.Cast;
import com.google.android.gms.cast.CastDevice;
import com.google.android.gms.cast.CastMediaControlIntent;
import com.google.android.gms.common.api.GoogleApiClient;

import java.util.HashMap;
import java.util.Map;

import io.vigour.nativewrapper.plugin.core.ActivityLifecycleListener;
import io.vigour.nativewrapper.plugin.core.Plugin;

public class ChromecastPlugin extends Plugin implements ActivityLifecycleListener {
	private static final String NAME = "chromecast";
	private static final String TAG = ChromecastPlugin.class.getName();

	public static final String ERROR_UNKNOWN_DEVICE = "unknown device";
	public static final String ERROR_ALREADY_CASTING = "already casting to a device";

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
		PENDING_CAST,
		CASTING,
	}

	private final Context _context;
	private final Map<String, MediaRouter.RouteInfo> _activeRoutes = new HashMap<>();
	private final MediaRouter _mediaRouter;
	private MediaRouteSelector _mediaRouteSelector;
	private MediaRouterCallback _mediaRouterCallback;
	private PluginStatus _status = PluginStatus.NEW;
	private boolean _isPendingCast = false;

	public ChromecastPlugin(@NonNull final Context context) {
		super(NAME);
		_context = context.getApplicationContext();
		_mediaRouter = MediaRouter.getInstance(_context);
	}

	public void init(@NonNull final DeferredMap settings) {
		final String appId = (String) settings.get("appId");

		_mediaRouteSelector = new MediaRouteSelector.Builder()
				//.addControlCategory(CastMediaControlIntent.categoryForRemotePlayback(appId))
				.addControlCategory(CastMediaControlIntent.categoryForRemotePlayback(CastMediaControlIntent.DEFAULT_MEDIA_RECEIVER_APPLICATION_ID))
				.build();

		_status = PluginStatus.READY;
	}

	public void startCasting(@NonNull final String deviceId) {
		if (!_activeRoutes.containsKey(deviceId)) {
			throw new IllegalArgumentException(ERROR_UNKNOWN_DEVICE);
		}

		switch (_status) {
			case CASTING:
			case PENDING_CAST:
				throw new IllegalStateException(ERROR_ALREADY_CASTING);
		}

		final MediaRouter.RouteInfo route = _activeRoutes.get(deviceId);
		final CastDevice castDevice = CastDevice.getFromBundle(route.getExtras());
		final Cast.CastOptions apiOptions = new Cast.CastOptions.Builder(castDevice, new CastListener(this)).build();

		final GoogleApiClient apiClient = new GoogleApiClient.Builder(_context)
				.addApi(Cast.API, apiOptions)
				.addConnectionCallbacks(new GoogleApiClient.ConnectionCallbacks() {
					@Override
					public void onConnected(Bundle bundle) {
						_status = PluginStatus.CASTING;
					}

					@Override
					public void onConnectionSuspended(int i) {
					}
				})
				//.addOnConnectionFailedListener(mConnectionFailedListener)
				.build();

		apiClient.connect();
		_status = PluginStatus.PENDING_CAST;
	}

	public void stopCasting() {
		//final GoogleApiClient apiClient;
		//apiClient.disconnect();
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
	}

	public void onApplicationStatusChanged() {
	}

	private void sendDeviceEvent(@NonNull DeviceEvent event, @NonNull String deviceId, @NonNull String deviceName) {
		final String json = String.format("{\"id\":\"%s\", \"name\": \"%s\"}", deviceId, deviceName);
		sendEvent(event.toString(), json);
	}

	@Override
	public void onStart() {
		_mediaRouterCallback = new MediaRouterCallback(this);
		_mediaRouter.addCallback(_mediaRouteSelector, _mediaRouterCallback,
				MediaRouter.CALLBACK_FLAG_REQUEST_DISCOVERY);
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
