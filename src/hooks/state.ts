import observe from '../observer'
import Dependency from '../observer/dependeny'

export default function useState(state: any) {
  if (!Dependency.target) {
    throw new Error('please call useState at top level in a component')
  } else {
    const instance = Dependency.target.instance
    if (!instance.node) {
      // if the component is mounting, it won't have an node
      instance.states.push(observe(state, Dependency.target))
    }

    const currentState = instance.currentState
    if (!currentState) {
      throw new Error('unmatch any states. please don\'t call useState in if/loop statement')
    } else {
      return currentState
    }
  }
}