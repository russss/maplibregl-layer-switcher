export class Layer {
  id: string
  prefix: string
  title: string
  enabled: boolean = false

  constructor(id: string, title: string, prefix: string, enabled = false) {
    this.id = id
    this.prefix = prefix
    this.title = title
    this.enabled = enabled
  }
}

export class LayerGroup {
  layers: Layer[]
  title: string

  constructor(title: string, layers: Layer[]) {
    this.title = title
    this.layers = layers
  }
}
