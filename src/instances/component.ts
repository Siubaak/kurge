import { is } from '../utils/index'
import { getNode } from '../utils/dom'
import { instantiate } from '../renderer/index'
import reconciler from '../renderer/reconciler'
import { VDomNode, Elem, Component, Instance } from '../common/types'

import Watcher from '../observer/watcher'
import { pushTarget, popTarget } from '../observer/dependeny'

// custom function component instance class
export default class ComponentInstance implements Instance {
  id: string
  index: number
  private element: VDomNode
  private component: Component
  private renderedInstance: Instance

  constructor(element: Elem) {
    this.element = element as VDomNode
  }

  get key(): string {
    return this.element && this.element.key != null
      ? 'k_' + this.element.key
      : this.index != null
        ? '' + this.index
        : null
  }
  get node(): HTMLElement {
    return getNode(this.id)
  }

  mount(id: string, context?: any): string {
    this.id = id
    
    this.component = ((this.element as VDomNode).type as Component)

    const watcher: Watcher = new Watcher(this)

    pushTarget(watcher)
    const renderedElement: VDomNode = this.component(this.element.props, context)
    this.renderedInstance = instantiate(renderedElement)
    popTarget()
    watcher.cleanUp()

    const markup = this.renderedInstance.mount(id)

    return markup
  }
  same(nextElement: Elem): boolean {
    return is.object(nextElement)
      && (nextElement as VDomNode).type === this.element.type
      && (nextElement as VDomNode).key === this.element.key
  }
  update(nextElement: Elem, context?: any): void {
    nextElement = nextElement == null
      ? this.element
      : (nextElement as VDomNode)

    const nextRenderedElement: VDomNode = this.component(nextElement.props, context)
    reconciler.enqueueUpdate(this.renderedInstance, nextRenderedElement)

    this.element = nextElement
  }
  unmount() {
    this.renderedInstance.unmount()
    delete this.id
    delete this.index
    delete this.element
    delete this.component
    delete this.renderedInstance
  }
}
