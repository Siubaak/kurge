import render from './renderer/index'
import createElement from './vdom/create'

import useState from './hooks/state'
import useContext from './hooks/context'

const Keactive = {
  render,
  createElement,
  useState,
  useContext
}

try {
  (window as any).Keactive = Keactive
} catch (err) {
  /* empty */
}

export default Keactive