import { is } from '../utils/index'
import { getNode } from '../utils/dom'
import { DATA_ID } from '../common/constants'
import { Elem, Instance } from '../common/types'

// empty node or text node
export default class TextInstance implements Instance {
  id: string
  index: number
  private element: number | string

  constructor(element: Elem) {
    this.element = '' + element as (number | string)
  }

  get key(): string {
    return this.index != null
      ? '' + this.index
      : null
  }
  get node(): HTMLElement {
    return getNode(this.id)
  }

  mount(id: string): string {
    this.id = id
    return `<span ${DATA_ID}="${id}" >${this.element}</span>`
  }
  same(nextElement: Elem): boolean {
    return is.number(nextElement) || is.string(nextElement)
  }
  update(nextElement: Elem): void {
    nextElement = is.undefined(nextElement) || is.null(nextElement)
      ? this.element
      : '' + (nextElement as (number | string))
    
    if (this.element !== nextElement) {
      this.element = nextElement
      this.node.innerText = this.element as string
    }
  }
  unmount() {
    this.node.remove()
    delete this.id
    delete this.index
    delete this.element
  }
}
