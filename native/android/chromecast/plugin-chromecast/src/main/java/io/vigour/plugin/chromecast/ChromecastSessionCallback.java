package io.vigour.plugin.chromecast;

public abstract class ChromecastSessionCallback {
	public void onSuccess() {
		onSuccess(null);
	}
	abstract void onSuccess(Object object);
	abstract void onError(String reason);
}