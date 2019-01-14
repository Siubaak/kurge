import { is } from '../utils/index'
import bus from '../utils/effect-bus'
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
  state: any = null
  refs: { [ref: string]: HTMLElement } = {}
  watcher: Watcher = new Watcher(this)
  private element: VDomNode
  private component: Component
  private renderedInstance: Instance

  constructor(element: Elem) {
    this.element = element as VDomNode
    this.component = ((this.element as VDomNode).type as Component)
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

  mount(id: string): string {
    pushTarget(this.watcher)
    this.renderedInstance = instantiate(this.component(this.element.props))
    const markup = this.renderedInstance.mount(this.id = id)
    popTarget()
    this.watcher.clean()
    return markup
  }
  same(nextElement: Elem): boolean {
    return is.object(nextElement)
      && (nextElement as VDomNode).type === this.element.type
      && (nextElement as VDomNode).key === this.element.key
  }
  update(nextElement: Elem): void {
    nextElement = nextElement == null ? this.element : (nextElement as VDomNode)
    
    pushTarget(this.watcher)
    reconciler.enqueueUpdate(this.renderedInstance, this.component(nextElement.props))
    popTarget()
    this.watcher.clean()

    this.element = nextElement
  }
  unmount() {
    bus.emit(`before-unmount:${this.id}`)
    this.renderedInstance.unmount()
    this.watcher.clean()
    delete this.index
    delete this.state
    delete this.refs
    delete this.watcher
    delete this.element
    delete this.component
    delete this.renderedInstance
    bus.emit(`unmounted:${this.id}`)
    bus.clean(`before-update:${this.id}`)
    bus.clean(`updated:${this.id}`)
    bus.clean(`before-unmount:${this.id}`)
    bus.clean(`unmounted:${this.id}`)
    delete this.id
  }
}
