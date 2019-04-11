import render from './renderer'
import createElement from './vdom'
import createContext from './context'

import useState from './hooks/state'
import useRefs from './hooks/refs'
import useEffect from './hooks/effect'

import { version } from '../package.json'

export default {
  // kurge info
  version,
  // top-level methods
  render,
  createElement,
  createContext,
  // built-in hooks
  useState,
  useRefs,
  useEffect
}