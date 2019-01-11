import { Elem, VDomNode, Component } from '../common/types'
import { Instance } from '../common/types'
import { is } from '../utils/index'
import TextInstance from '../instances/text'
import DOMInstance from '../instances/dom'
import ComponentInstance from '../instances/component'
import createElement from '../vdom/create'

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
  }
  return instance
}

// render markup and mount
export default function render(component: Component, container: HTMLElement) {
  const instance: Instance = instantiate(createElement(component))
  const markup: string = instance.mount('k')
  container.innerHTML = markup
}