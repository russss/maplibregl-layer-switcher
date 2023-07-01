# MapLibre GL Layer Switcher

This is a layer switcher component for MapLibre GL JS, which I use on [OpenInfraMap](https://openinframap.org).
Layers are selected by the string prefix of the layer name.

This package also includes a modified URL hash component which allows a compact representation of the enabled
layers to be added to the URL hash.

This package was formerly called `mapboxgl-layer-switcher` but after renaming it does not support Mapbox GL.

## Use

These steps assume you're using Webpack with css-loader. First, import the layer switcher component:
```javascript
import LayerSwitcher from '@russss/maplibregl-layer-switcher';
```

Assuming you are using a build system which supports CSS imports, the CSS should be imported automatically.

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

const map = new maplibregl.Map({style: style, container: 'map'});
map.addControl(layer_switcher, 'top-right');
```

## URL Hash

To include layers in the URL hash, first import and create the `URLHash` object, passing in your `LayerSwitcher`:

```javascript
import URLHash from '@russss/maplibregl-layer-switcher/urlhash';
// ...
const url_hash = new URLHash(layer_switcher);
```

When creating the map, you need to call `url_hash.init`, passing in your default map options. The URLHash class will
update the `zoom` and `center` options if they're provided in the URL hash. Then call `url_hash.enable` on the map:
```javascript
var map = new maplibregl.Map(url_hash.init({
	container: 'map',
	style: style,
	minZoom: 2,
	maxZoom: 17.9,
	center: [12, 26],
}));

url_hash.enable(map);
```

The URLHash object doesn't currently support tilt and rotation parameters.
