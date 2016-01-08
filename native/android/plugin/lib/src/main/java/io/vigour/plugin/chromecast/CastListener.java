package io.vigour.plugin.chromecast;

import android.support.annotation.NonNull;

import com.google.android.gms.cast.Cast;

public class CastListener extends Cast.Listener {

	private final ChromecastPlugin _plugin;

	public CastListener(@NonNull ChromecastPlugin plugin) {
		_plugin = plugin;
	}

	@Override
	public void onApplicationDisconnected(int statusCode) {
		_plugin.onApplicationDisconnected(statusCode);
	}

	@Override
	public void onApplicationStatusChanged() {
		_plugin.onApplicationStatusChanged();
	}
}
