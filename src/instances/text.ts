import { is } from '../utils'
import { getNode, createNode } from '../utils/dom'
import { DATA_ID } from '../shared/constants'
import { Elem, Instance } from '../shared/types'
import emitter from '../utils/emitter'

// empty node or text node
export default class TextInstance implements Instance {
  id: string
  index: number
  node: Text = null
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
    emitter.on('loaded', () => {
      const wrapper = getNode(this.id)
      if (wrapper) {
        this.node = wrapper.firstChild as Text
        if (!this.node) {
          this.node = createNode('') as Text
        }
        wrapper.parentNode.insertBefore(this.node, wrapper)
        wrapper.remove()
      }
    })

    return `<span ${DATA_ID}="${id}" >${this.element}</span>`
  }
  same(nextElement: Elem): boolean {
    return is.number(nextElement) || is.string(nextElement)
  }
  update(nextElement: Elem): void {
    nextElement = nextElement == null ? this.element : '' + (nextElement as (number | string))

    if (!this.node) {
      this.element = nextElement
      return
    }

    if (this.element !== nextElement) {
      this.element = nextElement
      this.node.textContent = this.element as string
    }
  }
  unmount() {
    if (this.node) {
      this.node.remove()
    }
    delete this.id
    delete this.node
    delete this.index
    delete this.element
  }
}
