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
  isMultiSelect?: boolean
  id?: string

  /**
   * A group of layers shown in the layer switcher.
   *
   * @param title name of the group to be shown.
   * @param layers list of layers in the group.
   * @param isMultiSelect use radio buttons instead of checkboxes when set to false. Will use layer switcher
   *                       isMultiSelect if left empty.
   * @param id this is needed to use radioboxes. Will use layer switcher id if left empty.
   */
  constructor(title: string, layers: Layer[])
  constructor(title: string, layers: Layer[], isMultiSelect: true)
  constructor(title: string, layers: Layer[], isMultiSelect: false, id?: string)
  constructor(title: string, layers: Layer[], isMultiSelect?: boolean, id?: string) {
    this.title = title
    this.layers = layers
    this.isMultiSelect = isMultiSelect
    this.id = id
  }
}
