import { is, eventHandlerWrapper } from '../utils'
import { diff, patch } from '../renderer/diff'
import { instantiate } from '../renderer'
import reconciler from '../renderer/reconciler'
import { DATA_ID, SUPPORTED_LISTENERS, PRIORITY } from '../shared/constants'
import { VDomNode, Elem, Instance } from '../shared/types'
import { getNode, getClassString, getStyleString } from '../utils/dom'
import Dependency from '../observer/dependeny'
import emitter from '../utils/emitter'

// dom node instance class
export default class DOMInstance implements Instance {
  id: string
  index: number
  node: HTMLElement = null
  private element: VDomNode
  private childInstances: Instance[]

  constructor(element: Elem) {
    this.element = element as VDomNode
  }

  get key(): string {
    return this.element && this.element.key != null
      ? 'k_' + this.element.key
      : this.index != null ? '' + this.index : null
  }

  mount(id: string): string {
    this.id = id

    // save node
    emitter.on('loaded', () => this.node = getNode(this.id))

    // node head
    let markup = `<${this.element.type} ${DATA_ID}="${id}" `
    if (this.element.key != null) {
      markup += `key="${this.element.key}" `
    }
    const props = this.element.props
    for (const prop in props) {
      if (prop === 'children') {
        // skip
        continue
      } else if (prop === 'className') {
        // invoke getClassString to transform
        markup += `class="${getClassString(props.className)}" `
      } else if (prop === 'style') {
        // invoke getStyleString to transform
        markup += `style="${getStyleString(props.style)}" `
      } else if (SUPPORTED_LISTENERS[prop.toLowerCase()] && is.function(props[prop])) {
        // add event listener
        emitter.on('loaded', () => {
          (this.node as any)[prop.toLowerCase()] = eventHandlerWrapper(props[prop])
        })
      } else {
        // assign any other properties
        markup += `${prop}="${props[prop]}" `
      }
    }
    markup += '>'

    // child nodes
    this.childInstances = []
    this.element.props.children.forEach((child: Elem, index: number) => {
      const instance: Instance = instantiate(child)
      instance.index = index
      markup += instance.mount(`${id}:${instance.key}`)
      this.childInstances.push(instance)
    })

    // tail
    markup += `</${this.element.type}>`
  
    // if set ref, return it when mounted
    if (is.string(this.element.ref) && Dependency.target) {
      const compInst = Dependency.target.instance
      emitter.on('loaded', () => compInst.refs[this.element.ref] = this.node)
    }
    
    emitter.on('loaded', () => {
      if (this.node) {
        this.node.removeAttribute(DATA_ID)
      }
    })

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

    const node = this.node
    const prevProps = this.element.props
    const nextProps = nextElement.props

    // update attributes
    for (const prop in nextProps) {
      if (prop === 'children') {
        // skip
        continue
      } else if (prop === 'className') {
        const nextClassName: string = getClassString(nextProps.className)
        if (node.className !== nextClassName) {
          // invoke getClassString to transform
          node.className = nextClassName
        }
      } else if (prop === 'style') {
        const nextStyle: string = getStyleString(nextProps.style)
        if (node.style.cssText !== nextStyle) {
          // invoke getStyleString to transform
          node.style.cssText = nextStyle
        }
      } else if (prop === 'value') {
        const nextValue: any = nextProps.value
        if ((node as any).value !== nextValue) {
          // use node.value instead of node.setAttribute('value')
          (node as any).value = nextValue
        }
      } else if (SUPPORTED_LISTENERS[prop.toLowerCase()] && is.function(nextProps[prop])) {
        const nextEventListener = nextProps[prop]
        if ((this.node as any)[prop.toLowerCase()] !== nextEventListener) {
          // replace a listener
          (this.node as any)[prop.toLowerCase()] = eventHandlerWrapper(nextEventListener)
        }
      } else {
        const nextAttr: any = nextProps[prop]
        if (node.getAttribute(prop) !== nextAttr) {
          // update any other properties
          node.setAttribute(prop, nextAttr)
        }
      }
    }

    // remove unnecessary attributes
    for (const prop in prevProps) {
      if (is.undefined(nextProps[prop]) || is.null(nextProps[prop])) {
        if (SUPPORTED_LISTENERS[prop.toLowerCase()] && is.function(nextProps[prop])) {
          // remove the listener
          delete (this.node as any)[prop.toLowerCase()]
        } else {
          // remove the attribute
          node.removeAttribute(prop !== 'className' ? prop : 'class')
        }
      }
    }

    const prevChildInstances = this.childInstances
    const nextChildren = nextElement.props.children

    // update child nodes
    if (
      prevChildInstances.length === 1
      && nextChildren.length === 1
      && prevChildInstances[0].same(nextChildren[0])
    ) {
      // most common condition: only one and the same node
      reconciler.enqueueUpdate(prevChildInstances[0], nextChildren[0])
    } else {
      patch(this, diff(prevChildInstances, nextChildren))
    }

    this.element = nextElement
  }
  unmount() {
    this.childInstances.forEach((child: Instance) => child.unmount())
    if (this.node) this.node.remove()
    delete this.id
    delete this.node
    delete this.index
    delete this.element
    delete this.childInstances
  }
}
