import useData from './hooks/data'
import render from './renderer/index'
import createElement from './vdom/create'

const Keactive = {
  render,
  createElement,
  useData
}

try {
  (window as any).Keactive = Keactive
} catch (err) {
  /* empty */
}

export default Keactive