import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { LayerSwitcher, Layer, URLHash, LayerGroup } from './src'
import './src/layerswitcher.css'

const layers = [
  new LayerGroup('Artificial', [
    new Layer('b', 'Borders', 'boundary'),
    new Layer('l', 'Landuse', 'landuse_', true),
    new Layer('r', 'Roads', 'road_', true),
    new Layer('B', 'Buildings', 'building', true)
  ]),
  new LayerGroup('Natural', [new Layer('w', 'Water', 'water', true)]),
  new Layer('L', 'Labels', 'label', true)
]

const layerSwitcher = new LayerSwitcher(layers)
const urlHash = new URLHash(layerSwitcher)

const style = await fetch('https://tiles.openfreemap.org/styles/liberty').then((res) => res.json())

layerSwitcher.setInitialVisibility(style)

const map = new maplibregl.Map(
  urlHash.init({
    container: 'map',
    style: style
  })
)
urlHash.enable(map)

map.addControl(layerSwitcher, 'top-right')
