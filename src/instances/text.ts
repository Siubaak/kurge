import { is } from '../utils/index'
import { getNode } from '../utils/dom'
import { DATA_ID } from '../common/constants'
import { Elem, Instance } from '../common/types'
import bus from '../utils/effect-bus'

// empty node or text node
export default class TextInstance implements Instance {
  id: string
  index: number
  node: HTMLElement = null
  private element: number | string

  constructor(element: Elem) {
    this.element = '' + element as (number | string)
  }

  get key(): string {
    return this.index != null ? '' + this.index : null
  }

  mount(id: string): string {
    this.id = id

    // save node, remove span wrapper
    bus.on('mounted:refs', () => {
      const wrapper = getNode(this.id)
      this.node = wrapper.firstChild as HTMLElement
      wrapper.parentNode.insertBefore(this.node, wrapper)
      wrapper.remove()
    })

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
      this.node.textContent = this.element as string
    }
  }
  unmount() {
    this.node.remove()
    delete this.id
    delete this.index
    delete this.element
  }
}
