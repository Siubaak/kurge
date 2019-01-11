import observe from './observer/index'
import render from './renderer/index'
import createElement from './vdom/create'

const Keactive = {
  render,
  createElement,
  useData: observe
}

try {
  (window as any).Keactive = Keactive
} catch (err) {
  /* empty */
}

export default Keactive