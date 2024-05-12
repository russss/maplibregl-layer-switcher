import { list, List, RedomComponent, el, mount, s } from 'redom';
import invert from 'lodash.invert';
import isEqual from 'lodash.isequal';
import './layerswitcher.css';
import URLHash from './urlhash';
import type maplibregl from 'maplibre-gl';

class LayerSwitcher implements maplibregl.IControl {
  _layers: Record<string, string>;
  _identifiers: Record<string, string>;
  _default_visible: Array<string>;
  _container: HTMLElement;
  _visible: Array<string>;
  _layerList: List;
  _map: maplibregl.Map | undefined;
  urlhash: URLHash | undefined;

  constructor(layers: Record<string, string>, default_visible: Array<string> = []) {
    this._layers = layers;
    this._identifiers = this._initLayerIdentifiers();
    this._default_visible = default_visible;

    this._layerList = list('ul', LayerSwitcherItem, 'name');
    this._container = el('div', [el('h3', 'Layers'), this._layerList], { class: 'layer-switcher-list' });
    mount(document.body, this._container);
    this._visible = [...default_visible];
  }

  _initLayerIdentifiers() {
    let identifiers: Record<string, string> = {};
    Object.keys(this._layers)
      .sort()
      .forEach((layer_name) => {
        let size = 1;
        let ident = null;
        do {
          ident = layer_name.slice(0, size);
          size++;
        } while (ident in identifiers);
        identifiers[ident] = layer_name;
      });
    return identifiers;
  }

  _getLayerIdentifiers() {
    let identifiers: Array<string> = [];
    let id_map = invert(this._identifiers);
    this._visible.sort().forEach((layer_name) => {
      identifiers.push(id_map[layer_name]);
    });
    return identifiers;
  }

  _updateVisibility() {
    if (!this._map) {
      return;
    }

    var layers = this._map.getStyle().layers;
    for (let layer of layers) {
      let name = layer['id'];
      for (let layer_name in this._layers) {
        let pref = this._layers[layer_name];
        if (name.startsWith(pref)) {
          if (this._visible.includes(layer_name)) {
            this._map.setLayoutProperty(name, 'visibility', 'visible');
          } else {
            this._map.setLayoutProperty(name, 'visibility', 'none');
          }
        }
      }
    }
    if (this.urlhash) {
      this.urlhash._updateHash();
    }
  }

  /**
   * Modify a MapLibre GL style object before creating the map to set initial visibility states.
   * This prevents flash-of-invisible-layers.
   *
   * @param style the MapLibre GL style object to modify
   */
  setInitialVisibility(style: maplibregl.StyleSpecification) {
    for (let layer of style['layers']) {
      for (let layer_name in this._layers) {
        let pref = this._layers[layer_name];
        if (layer['id'].startsWith(pref) && !this._visible.includes(layer['id'])) {
          if (!layer['layout']) {
            layer['layout'] = {};
          }
          layer['layout']['visibility'] = 'none';
        }
      }
    }
    this._updateList();
  }

  getURLString() {
    if (!isEqual(this._visible.sort(), this._default_visible.sort())) {
      return this._getLayerIdentifiers().join(',');
    }
    return '';
  }

  setURLString(string: string) {
    if (string) {
      const ids = string.split(',');
      if (ids.length == 0) {
        this._visible = [...this._default_visible];
      } else {
        this._visible = ids.map((id) => this._identifiers[id]).filter((id) => id);
      }
    } else {
      this._visible = [...this._default_visible];
    }

    // If the style hasn't been loaded yet, don't update visibility or this causes
    // problems with the URLHash. Initial visibility is handled by the
    // `setInitialVisibility` method.
    if (this._map?.isStyleLoaded()) {
      this._updateVisibility();
    }
    this._updateList();
  }

  onAdd(map: maplibregl.Map) {
    this._map = map;
    if (map.isStyleLoaded()) {
      this._updateVisibility();
    } else {
      map.on('load', () => {
        this._updateVisibility();
      });
    }

    const button = el('button', {
      class: 'layer-switcher-button',
      'aria-label': 'Layer Switcher',
    });
    button.onmouseover = (e) => {
      var button_position = button.getBoundingClientRect();
      this._container.style.top = button_position.top + 'px';
      this._container.style.right = document.documentElement.clientWidth - button_position.right + 'px';
      this._container.style.display = 'block';
    };
    this._container.onmouseleave = (e) => {
      this._container.style.display = 'none';
    };

    return el('div', button, {
      class: 'maplibregl-ctrl maplibregl-ctrl-group layer-switcher',
    });
  }

  onRemove() {
    this._container.parentNode?.removeChild(this._container);
    this._map = undefined;
  }

  _updateList() {
    this._layerList.update(
      Object.keys(this._layers).map((name) => {
        return {
          enabled: this._visible.includes(name),
          name: name,
        };
      }),
      this,
    );
  }
}

class LayerSwitcherItem implements RedomComponent {
  el: HTMLElement;
  _checkbox: HTMLInputElement;
  _label: HTMLElement;
  layerSwitcher: LayerSwitcher | undefined;

  constructor() {
    this._checkbox = el('input', {
      type: 'checkbox',
    });
    this._label = el('label');
    this.el = el('li', this._label);

    this._checkbox.onchange = (e) => this.onChange(e);
  }

  onChange(e: Event) {
    if (!this.layerSwitcher) return;

    const name = this._label.innerText;

    if ((<HTMLInputElement>e.target).checked) {
      this.layerSwitcher._visible.push(name);
    } else {
      this.layerSwitcher._visible = this.layerSwitcher._visible.filter((item) => item !== name);
    }
    this.layerSwitcher._updateVisibility();
  }

  update(data: any, index: number, items: any, context?: any) {
    this.layerSwitcher = context;
    let label_for = 'layerSwitch' + index;
    this._checkbox.id = label_for;
    this._label.setAttribute('for', label_for);

    this._checkbox.checked = data.enabled;
    this._label.innerText = data.name;
    mount(this._label, this._checkbox);
  }
}

export default LayerSwitcher;
