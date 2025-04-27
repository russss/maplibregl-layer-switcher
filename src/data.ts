/**
 * A layer in the layer switcher.
 */
export class Layer {
  id: string
  prefix: string
  title: string
  groupId?: string;
  enabled: boolean = false

  /**
   * An item in the layer switcher.
   *
   * @param id alphanumeric identifier for the layer. This is included in the URL hash so should be as short
   *            as possible. Must be unique among all layers, or an error will be thrown.
   * @param title name of the layer as shown in the layer switcher.
   * @param prefix prefix of the layer in the map style to match.
   * @param groupId when group id is set the layer will be part of a radio button group.
   * @param enabled whether the layer is enabled by default.
   */
  constructor(id: string, title: string, prefix: string, enabled?: boolean)
  constructor(id: string, title: string, prefix: string, groupId: string, enabled?: boolean)
  constructor(id: string, title: string, prefix: string, groupIdOrEnabled: string | boolean = false, enabled = false) {
    this.id = id
    this.title = title
    this.prefix = prefix
    if (typeof groupIdOrEnabled === 'string') {
      this.groupId = groupIdOrEnabled
      this.enabled = enabled
    }
    else {
      this.enabled = groupIdOrEnabled
    }
  }
}

/**
 * A group of layers shown in the layer switcher.
 */
export class LayerGroup {
  layers: Layer[]
  title: string

  /**
   * A group of layers shown in the layer switcher.
   *
   * @param title name of the group to be shown.
   * @param layers list of layers in the group.
   */
  constructor(title: string, layers: Layer[]) {
    this.title = title
    this.layers = layers
  }
}
