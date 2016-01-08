package io.vigour.plugin.chromecast;

import android.support.annotation.NonNull;
import android.support.v7.media.MediaRouter;

class MediaRouterCallback extends MediaRouter.Callback {

	private final ChromecastPlugin _plugin;

	public MediaRouterCallback(@NonNull ChromecastPlugin plugin) {
		_plugin = plugin;
	}

	@Override
	public void onRouteAdded(MediaRouter router, MediaRouter.RouteInfo route) {
		_plugin.onRouteAdded(route);
	}

	@Override
	public void onRouteRemoved(MediaRouter router, MediaRouter.RouteInfo route) {
		_plugin.onRouteRemoved(route);
	}

	//TODO: check with marcus on how to handle route changes
	/*
	@Override
	public void onRouteChanged(MediaRouter router, MediaRouter.RouteInfo route) {
		_plugin.sendDeviceEvent(DeviceEvent.DEVICE_JOINED, route.getId(), route.getName());
		_plugin.sendDeviceEvent(DeviceEvent.DEVICE_LEFT, route.getId(), route.getName());
	}
	*/


}
