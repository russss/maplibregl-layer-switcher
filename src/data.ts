/**
 * A layer in the layer switcher.
 */
export class Layer {
  id: string
  prefix: string
  title: string
  enabled: boolean = false

  /**
   * An item in the layer switcher.
   *
   * @param id alphanumeric identifier for the layer. This is included in the URL hash so should be as short
   *            as possible. Must be unique among all layers, or an error will be thrown.
   * @param title name of the layer as shown in the layer switcher.
   * @param prefix prefix of the layer in the map style to match.
   * @param enabled whether the layer is enabled by default.
   */
  constructor(id: string, title: string, prefix: string, enabled = false) {
    this.id = id
    this.prefix = prefix
    this.title = title
    this.enabled = enabled
  }
}

/**
 * A group of layers shown in the layer switcher.
 */
export class LayerGroup {
  layers: Layer[]
  title: string
  id: string

  /**
   * A group of layers shown in the layer switcher.
   *
   * @param title name of the group to be shown.
   * @param layers list of layers in the group.
   */
  constructor(title: string, layers: Layer[]) {
    this.title = title
    this.id = title
    this.layers = layers
  }
}
