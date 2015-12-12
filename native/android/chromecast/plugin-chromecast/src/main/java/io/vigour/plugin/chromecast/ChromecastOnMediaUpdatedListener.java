package io.vigour.plugin.chromecast;

import org.json.JSONObject;

public interface ChromecastOnMediaUpdatedListener {
	void onMediaLoaded(JSONObject media);
	void onMediaUpdated(boolean isAlive, JSONObject media);
}