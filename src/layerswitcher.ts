import { list, List, RedomComponent, el, mount } from 'redom'
import isEqual from 'lodash.isequal'
import './layerswitcher.css'
import URLHash from './urlhash'
import { Layer } from './data'
import type maplibregl from 'maplibre-gl'

class LayerSwitcher implements maplibregl.IControl {
  _layers: Record<string, Layer>
  _container: HTMLElement
  _visible: string[]
  _default_visible: string[]
  _layerList: List
  _map: maplibregl.Map | undefined
  urlhash: URLHash | undefined

  constructor(layers: Layer[], title: string = 'Layers') {
    this._layers = {}
    for (let layer of layers) {
      if (this._layers[layer.id]) {
        throw new Error(`Duplicate layer ID "${layer.id}". Layer IDs must be unique.`)
      }
      this._layers[layer.id] = layer
    }

    this._visible = this._default_visible = layers.filter((layer) => layer.enabled).map((layer) => layer.id)

    this._layerList = list('ul', LayerSwitcherItem, 'name')
    this._container = el('div', [el('h3', title), this._layerList], { class: 'layer-switcher-list' })
    mount(document.body, this._container)
  }

  setVisibility(layerId: string, visible: boolean) {
    if (visible) {
      if (!this._visible.includes(layerId)) {
        this._visible.push(layerId)
      }
    } else {
      this._visible = this._visible.filter((item) => item !== layerId)
    }

    this._updateVisibility()
  }

  _updateVisibility() {
    if (!this._map) {
      return
    }

    var layers = this._map.getStyle().layers
    for (let layer of layers) {
      let name = layer['id']
      for (let layer_name in this._layers) {
        let pref = this._layers[layer_name].prefix
        if (name.startsWith(pref)) {
          if (this._visible.includes(layer_name)) {
            this._map.setLayoutProperty(name, 'visibility', 'visible')
          } else {
            this._map.setLayoutProperty(name, 'visibility', 'none')
          }
        }
      }
    }
    if (this.urlhash) {
      this.urlhash._updateHash()
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
        let pref = this._layers[layer_name].prefix
        if (layer['id'].startsWith(pref) && !this._visible.includes(layer['id'])) {
          if (!layer['layout']) {
            layer['layout'] = {}
          }
          layer['layout']['visibility'] = 'none'
        }
      }
    }
    this._updateList()
  }

  getURLString() {
    if (!isEqual(this._visible.sort(), this._default_visible.sort())) {
      return this._visible.sort().join(',')
    }
    return ''
  }

  setURLString(string: string) {
    if (string) {
      const ids = string.split(',')
      if (ids.length == 0) {
        this._visible = [...this._default_visible]
      } else {
        this._visible = ids.filter((id) => this._layers[id]).map((id) => id)
      }
    } else {
      this._visible = [...this._default_visible]
    }

    // If the style hasn't been loaded yet, don't update visibility or this causes
    // problems with the URLHash. Initial visibility is handled by the
    // `setInitialVisibility` method.
    if (this._map?.isStyleLoaded()) {
      this._updateVisibility()
    }
    this._updateList()
  }

  onAdd(map: maplibregl.Map) {
    this._map = map
    if (map.isStyleLoaded()) {
      this._updateVisibility()
    } else {
      map.on('load', () => {
        this._updateVisibility()
      })
    }

    const button = el('button', {
      class: 'layer-switcher-button',
      'aria-label': 'Layer Switcher'
    })
    button.onmouseover = () => {
      var button_position = button.getBoundingClientRect()
      this._container.style.top = button_position.top + 'px'
      this._container.style.right = document.documentElement.clientWidth - button_position.right + 'px'
      this._container.style.display = 'block'
    }
    this._container.onmouseleave = () => {
      this._container.style.display = 'none'
    }

    return el('div', button, {
      class: 'maplibregl-ctrl maplibregl-ctrl-group layer-switcher'
    })
  }

  onRemove() {
    this._container.parentNode?.removeChild(this._container)
    this._map = undefined
  }

  _updateList() {
    this._layerList.update(
      Object.keys(this._layers).map((id) => {
        const layer = this._layers[id]
        return {
          enabled: this._visible.includes(id),
          name: layer.title,
          id: id
        }
      }),
      this
    )
  }
}

class LayerSwitcherItem implements RedomComponent {
  el: HTMLElement
  _checkbox: HTMLInputElement
  _label: HTMLElement
  layerSwitcher: LayerSwitcher | undefined
  id?: string

  constructor() {
    this._checkbox = el('input', {
      type: 'checkbox'
    })
    this._label = el('label')
    this.el = el('li', this._label)

    this._checkbox.onchange = (e) => this.onChange(e)
  }

  onChange(e: Event) {
    if (!this.layerSwitcher) return

    this.layerSwitcher.setVisibility(this.id!, (<HTMLInputElement>e.target).checked)
  }

  update(data: any, index: number, items: any, context?: any) {
    this.id = data.id
    this.layerSwitcher = context

    const label_for = 'layerSwitch' + data.id
    this._checkbox.id = label_for
    this._label.setAttribute('for', label_for)

    this._checkbox.checked = data.enabled
    this._label.innerText = data.name
    mount(this._label, this._checkbox)
  }
}

export default LayerSwitcher
