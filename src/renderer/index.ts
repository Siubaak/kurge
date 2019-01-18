import { Elem, VDomNode } from '../common/types'
import { Instance } from '../common/types'
import { is } from '../utils/index'
import TextInstance from '../instances/text'
import DOMInstance from '../instances/dom'
import ComponentInstance from '../instances/component'
import createElement from '../vdom/create'
import emitter from '../utils/emitter'
import { createNode } from '../utils/dom'

// instantiate vdom element 
export function instantiate(element: Elem) {
  let instance: Instance = null
  if (
    is.undefined(element)
    || is.null(element)
    || is.number(element)
    || is.string(element)
  ) {
    // number and string hint the end of vdom tree, and it must be a text node
    instance = new TextInstance(element as string)
  } else if (is.string((element as VDomNode).type)) {
    // if element.type is string, it means this element is a dom node, like p/h1/div
    instance = new DOMInstance(element as VDomNode)
  } else if (is.function((element as VDomNode).type)) {
    // if element.type is function, it is a component
    instance = new ComponentInstance(element as VDomNode)
  } else {
    throw new Error('illegal VDOM node type, please do not return array/null/undefined/etc in an app')
  }
  return instance
}

// render markup and mount
export default function render(vdom: VDomNode, container: HTMLElement) {
  if (!is.object(vdom)) {
    throw new Error('please offer a legal VDOM node')
  } else if (!container) {
    throw new Error('a root DOM node is needed to mount the app')
  }
  let instance: Instance = null
  if (is.string(vdom.type)) {
    instance = instantiate(createElement(() => vdom))
  } else {
    instance = instantiate(vdom)
  }
  const markup: string = instance.mount('kg')
  const node = createNode(markup)
  container.parentNode.insertBefore(node, container)
  container.remove()
  emitter.emit('loaded')
  emitter.emit('mounted')
}
