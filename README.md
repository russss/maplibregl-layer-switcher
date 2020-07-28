# MapboxGL Layer Switcher

This is a layer switcher component for Mapbox GL JS, which I use on [OpenInfraMap](https://openinframap.org). Layers are
selected by the string prefix of the layer name.

This package also includes a modified URL hash component which allows a compact representation of the enabled
layers to be added to the URL hash.

## Use

These steps assume you're using Webpack with css-loader. First, import the layer switcher component and the CSS:
```javascript
import '@russss/mapboxgl-layer-switcher/layerswitcher.css'
import LayerSwitcher from '@russss/mapboxgl-layer-switcher';
```

Now define your layers as an object mapping the layer name to the prefix of the Mapbox GL layers you
want to switch. We also define a list of layers which will be initially enabled:
```javascript
const layers = {
	Power: 'power_',
	'Solar Generation': 'heatmap_',
	Labels: 'place_',
};

const layers_enabled = ['Power', 'Labels'];
const layer_switcher = new LayerSwitcher(layers, layers_enabled);
```

Adding the layer switcher to the map after it's been initialised will result in the hidden layers being briefly
shown. To avoid this, we need to load the style into JS first (I usually bundle it with the rest of my JS), and
call the `setInitialVisibility` method on the loaded style object.

```javascript
const style = //...load map style JSON into an object
layer_switcher.setInitialVisibility(style);
```

Now we can instantiate our map and add the layer switcher to it:
```javascript

const map = new mapboxgl.Map({style: style, container: 'map'});
map.addControl(layer_switcher, 'top-right');
```

## URL Hash

To include layers in the URL hash, first import and create the `URLHash` object, passing in your `LayerSwitcher`:

```javascript
import URLHash from '@russss/mapboxgl-layer-switcher/urlhash';
// ...
const url_hash = new URLHash(layer_switcher);
```

When creating the map, you need to merge the result of `url_hash.getPosition()` with the map options, and then
call `url_hash.enable` on the map:

```javascript
var map = new mapboxgl.Map(Object.assign({
	container: 'map',
	style: style,
	minZoom: 2,
	maxZoom: 17.9,
	center: [12, 26],
}, url_hash.getPosition()));

url_hash.enable(map);
```

