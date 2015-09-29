package io.vigour.plugin.statusbar;

import java.util.HashMap;
import java.util.Map;

/**
 * Created by michielvanliempt on 26/09/15.
 */
public class MapWrapper {
    Map<String, Object> root;

    public MapWrapper(Object object) {
        root = (Map<String, Object>) object;
    }

    public MapWrapper() {
        root = new HashMap<>();
    }

    public boolean has(String... keys) {
        Map<String, Object> node = root;
        for (int i=0 ; i<keys.length ; i++) {
            String k = keys[i];
            if (!node.containsKey(k)) {
                return false;
            }
            if (i<keys.length - 1) {
                node = (Map<String, Object>) node.get(k);
            }
        }
        return true;
    }

    public Object get(String... keys) {
        Map<String, Object> node = root;
        for (int i=0 ; i<keys.length-1 ; i++) {
            String k = keys[i];
            if (!node.containsKey(k)) {
                return null;
            } else {
                node = (Map<String, Object>) node.get(k);
            }
        }
        return node.get(keys[keys.length - 1]);
    }

    public String getString(String... keys) {
        return (String) get(keys);
    }

    public Float getFloat(String... keys) {
        Object raw = get(keys);
        if (raw instanceof Number) {
            return ((Number) raw).floatValue();
        }
        if (raw instanceof String) {
            return Float.parseFloat((String) raw);
        }
        return (Float) raw;
    }

    public MapWrapper set(String key, Object value) {
        return set(value, key);
    }

    public MapWrapper set(String key1, String key2, Object value) {
        return set(value, key1, key2);
    }

    public MapWrapper set(String key1, String key2, String key3, Object value) {
        return set(value, key1, key2, key3);
    }

    private MapWrapper set(Object value, String... keys) {
        Map<String, Object> node = root;
        for (int i=0 ; i<keys.length-1 ; i++) {
            String k = keys[i];
            if (!node.containsKey(k)) {
                Map<String, Object> newNode = new HashMap<>();
                node.put(k, newNode);
                node = newNode;
            } else {
                node = (Map<String, Object>) node.get(k);
            }
        }
        node.put(keys[keys.length - 1], value);
        return this;
    }

    public Map<String, Object> map() {
        return root;
    }
}
