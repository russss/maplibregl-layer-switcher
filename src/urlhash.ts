import LayerSwitcher from './index';
import type maplibregl from 'maplibre-gl';

export interface HashComponents {
  zoom?: number;
  center?: [number, number];
  layers?: string;
  additional: Record<string, string>;
}

export function decodeHash(hash: string): HashComponents {
  const loc = hash.replace('#', '').split('/');
  let result: HashComponents = { additional: {} };
  if (loc.length < 3) {
    return result;
  }
  result.layers = '';
  result.zoom = +loc[0];
  result.center = [+loc[2], +loc[1]];

  for (let i = 3; i < loc.length; i++) {
    let component = loc[i];
    let matches = component.match(/^(\w+)=(.*)$/);
    if (matches) {
      result.additional = result.additional || {};
      result.additional[matches[1]] = matches[2];
    } else {
      result.layers = component;
    }
  }

  return result;
}

export function encodeHash(components: HashComponents): string {
  if (!components.zoom || !components.center) {
    return '';
  }

  const zoom = Math.round(components.zoom * 100) / 100,
    // derived from equation: 512px * 2^z / 360 / 10^d < 0.5px
    precision = Math.ceil((zoom * Math.LN2 + Math.log(512 / 360 / 0.5)) / Math.LN10),
    m = Math.pow(10, precision),
    lng = Math.round(components.center[0] * m) / m,
    lat = Math.round(components.center[1] * m) / m;
  // bearing = this._map.getBearing(),
  // pitch = this._map.getPitch();

  let hash = `#${zoom}/${lat}/${lng}`;

  if (components.layers) {
    hash += '/' + components.layers;
  }

  if (components.additional) {
    for (let key in components.additional) {
      hash += '/' + key + '=' + components.additional[key];
    }
  }

  return hash;
}

type ParameterCallbackFunction = (value: string | null) => void;

class URLHash {
  layerSwitcher: LayerSwitcher;
  _map: maplibregl.Map | undefined;
  additional: Record<string, string>;
  handlers: Record<string, ParameterCallbackFunction>;

  constructor(layerSwitcher: LayerSwitcher) {
    this.layerSwitcher = layerSwitcher;
    this.additional = {};
    this.handlers = {};
  }

  enable(map: maplibregl.Map) {
    this._map = map;

    this._onHashChange(window.location.hash);

    map.on('moveend', () => {
      this._updateHash();
    });

    window.addEventListener(
      'hashchange',
      () => {
        this._onHashChange(window.location.hash);
      },
      false,
    );
  }

  /**
   * Register a handler for a URL hash parameter. The key will be included in
   * the URL hash, so keep it as short as possible.
   *
   * @param key short key used to identify the parameter in the URL hash
   * @param handler handler function that will be called when the parameter changes
   */
  registerHandler(key: string, handler: ParameterCallbackFunction) {
    this.handlers[key] = handler;
  }

  /**
   * Set a custom URL hash parameter. Use `registerHandler` to receive a notification
   * when the parameter changes.
   *
   * @param key short key used to identify the parameter in the URL hash
   * @param value the value of the parameter, or null to remove it.
   */
  setParameter(key: string, value: string | null) {
    if (this.additional[key] !== value) {
      if (value === null) {
        delete this.additional[key];
      } else {
        this.additional[key] = value;
      }
      this._updateHash();
    }
  }

  _fireParameterChange(key: string, value: string | null) {
    if (this.handlers[key]) {
      this.handlers[key](value);
    }
  }

  _onHashChange(new_hash: string) {
    const hash = decodeHash(new_hash);

    // Check for changes in the additional parameters and fire callbacks.
    // We need to do this first as calling jumpTo generates an _updateHash event
    // which will lose our additional parameters.
    let parameter_keys = [...Object.keys(hash.additional), ...Object.keys(this.additional)];
    for (let key of parameter_keys) {
      if (this.additional[key] && !hash.additional[key]) {
        delete this.additional[key];
        this._fireParameterChange(key, null);
      } else if (hash.additional[key] && this.additional[key] !== hash.additional[key]) {
        this.additional[key] = hash.additional[key];
        this._fireParameterChange(key, hash.additional[key]);
      }
    }

    if (this._map?.isStyleLoaded() && hash.center && hash.zoom) {
      this._map.jumpTo({
        center: hash.center,
        zoom: hash.zoom,
      });
    }

    if (this.layerSwitcher && hash.layers !== undefined) {
      this.layerSwitcher.setURLString(hash.layers);
    }
  }

  _updateHash() {
    const newHash = this.getHashString();
    try {
      window.history.replaceState(window.history.state, '', newHash);
    } catch (e) {
      console.log(e);
    }
  }

  getHashString() {
    if (!this._map) {
      throw new Error('getHashString called before map initialised');
    }

    const { lng, lat } = this._map.getCenter();
    const components: HashComponents = {
      center: [lng, lat],
      zoom: this._map.getZoom(),
      additional: this.additional,
    };

    if (this.layerSwitcher) {
      components.layers = this.layerSwitcher.getURLString();
    }
    return encodeHash(components);
  }

  /**
   * Modify MapLibre GL map constructor options to include values from the URL hash.
   *
   * @param options the original options passed to the MapLibre GL `Map` constructor.
   *      You should include defaults for the `center` and `zoom` parameters.
   * @returns an options object to be passed to the `Map` constructor, with the
   *      `center` and `zoom` parameters updated if necessary. Other options are untouched.
   */
  init(options: maplibregl.MapOptions): maplibregl.MapOptions {
    options.hash = false;
    const loc = window.location.hash.replace('#', '').split('/');
    if (loc.length >= 3) {
      options.center = [+loc[2], +loc[1]];
      options.zoom = +loc[0];
    }
    return options;
  }
}

export default URLHash;
