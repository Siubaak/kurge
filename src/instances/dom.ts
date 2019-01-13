import { is } from '../utils/index'
import { diff, patch } from '../renderer/diff'
import { instantiate } from '../renderer/index'
import eventListenerSet from '../event/index'
import reconciler from '../renderer/reconciler'
import { DATA_ID, CUT_ON_REGEX, SUPPORTED_LISTENERS } from '../common/constants'
import { VDomNode, Elem, Patches, Instance } from '../common/types'
import { getNode, getClassString, getStyleString } from '../utils/dom'
import Dependency from '../observer/dependeny'
import bus from '../utils/effect-bus'

// dom node instance class
export default class DOMInstance implements Instance {
  id: string
  index: number
  private element: VDomNode
  private childInstances: Instance[]

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

  mount(id: string): string {
    this.id = id

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
      } else if (
        SUPPORTED_LISTENERS[prop.toLowerCase()]
        && is.function(props[prop])
      ) {
        // delegate a listener
        eventListenerSet.set(
          id,
          prop.toLowerCase().replace(CUT_ON_REGEX, ''),
          props[prop],
        )
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
      bus.on('mounted:refs', () => compInst.refs[this.element.ref] = this.node)
    }

    return markup
  }
  same(nextElement: Elem): boolean {
    return is.object(nextElement)
      && (nextElement as VDomNode).type === this.element.type
      && (nextElement as VDomNode).key === this.element.key
  }
  update(nextElement: Elem): void {
    nextElement = nextElement == null
      ? this.element
      : (nextElement as VDomNode)

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
        const event: string = prop.toLowerCase().replace(CUT_ON_REGEX, '')
        const prevEventListener = eventListenerSet.get(this.id, event)
        const nextEventListener = nextProps[prop]
        if (prevEventListener !== nextEventListener) {
          // delegate a listener
          eventListenerSet.set(this.id, event, nextEventListener)
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
          eventListenerSet.remove(this.id, prop.toLowerCase().replace(CUT_ON_REGEX, ''))
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
      const patches: Patches = diff(prevChildInstances, nextChildren)
      patch(this.id, patches)
    }

    this.element = nextElement
  }
  unmount() {
    eventListenerSet.clean(this.id)
    this.childInstances.forEach((child: Instance) => child.unmount())
    this.node.remove()
    delete this.id
    delete this.index
    delete this.element
    delete this.childInstances
  }
}
