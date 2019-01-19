import render from './renderer'
import createElement from './vdom'

import useState from './hooks/state'
import useContext from './hooks/context'
import useRefs from './hooks/refs'
import useEffect from './hooks/effect'

import { version } from '../package.json'

const Kurge = {
  version,

  render,
  createElement,

  useState,
  useContext,
  useRefs,
  useEffect
}

export default Kurge