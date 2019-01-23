import { is } from '../utils'
import emitter from '../utils/emitter'
import { instantiate } from '../renderer'
import reconciler from '../renderer/reconciler'
import { VDomNode, Elem, Component, Instance } from '../shared/types'

import Watcher from '../observer/watcher'
import { pushTarget, popTarget } from '../observer/dependeny'

// custom function component instance class
export default class ComponentInstance implements Instance {
  id: string
  index: number
  refs: { [ref: string]: HTMLElement } = {}
  watcher: Watcher = new Watcher(this)
  guards: any[] = []
  guardLeft: number = 0
  states: any[] = []
  private stateId: number = 0
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
      : this.index != null ? '' + this.index : null
  }
  get node(): Text | HTMLElement {
    return this.renderedInstance ? this.renderedInstance.node : null
  }

  get currentState(): any {
    return this.states[this.stateId++]
  }
  get prevGuard(): any {
    if (this.guardLeft) {
      this.guardLeft--
      return this.guards.shift()
    }
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
    if (!this.node) return

    nextElement = nextElement == null ? this.element : (nextElement as VDomNode)

    let shouldUpdate = true
    if (is.function(this.component.shouldUpdate)) {
      shouldUpdate = this.component.shouldUpdate(this.element.props, nextElement.props)
    }

    if (shouldUpdate) {
      this.stateId = 0
      this.guardLeft = this.guards.length
    
      pushTarget(this.watcher)
      reconciler.enqueueUpdate(this.renderedInstance, this.component(nextElement.props))
      popTarget()
      this.watcher.clean()
    }

    this.element = nextElement
  }
  unmount() {
    emitter.emit(`unmount:${this.id}`)
    this.renderedInstance.unmount()
    this.watcher.clean()
    delete this.id
    delete this.index
    delete this.guards
    delete this.guardLeft
    delete this.states
    delete this.stateId
    delete this.refs
    delete this.watcher
    delete this.element
    delete this.component
    delete this.renderedInstance
  }
}
