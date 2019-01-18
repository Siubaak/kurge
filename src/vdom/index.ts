import { is, hasOwn } from '../utils'
import { RESERVED_PROPS } from '../common/constants'
import { Elem, Props, VDomNode, Component } from '../common/types'

// create vdom node
export default function createElement(
  type: string | Component,
  config?: any,
  ...children: (Elem | Elem[])[]
): VDomNode {
  const props: Props = { children: [].concat(...children) }
  let key: string = null
  let ref: string = null
  if (config) {
    if (config.key != null) {
      key = ('' + (config.key as string)).replace(/:/g, '_')
    }
    if (config.ref && is.string(config.ref)) {
      ref = config.ref
    }
    for (const prop in config) {
      if (hasOwn(config, prop) && !RESERVED_PROPS[prop]) {
        props[prop] = config[prop]
      }
    }
  }
  return { type, key, ref, props }
}