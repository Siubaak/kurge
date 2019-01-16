import render from './renderer/index'
import createElement from './vdom/create'

import useState from './hooks/state'
import useContext from './hooks/context'
import useRefs from './hooks/refs'

import useEffect from './hooks/effect'

const Kurge = {
  render,
  createElement,

  useState,
  useContext,
  useRefs,
  useEffect
}

export default Kurge