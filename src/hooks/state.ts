import observe from '../observer/index'
import Dependency from '../observer/dependeny'
import { PROXY_TARGET } from '../common/constants'
import { assign } from '../utils/index'

export default function useState(state: any) {
  if (!Dependency.target) {
    throw new Error('please call useState at top level in a component')
  } else {
    const instance = Dependency.target.instance
    if (!instance.id) {
      // if the component is mounting, it won't have an id
      // merge duplicate states when invoke useState multiple times in a same component
      if (instance.state) {
        assign(instance.state[PROXY_TARGET], observe(state)[PROXY_TARGET])
      } else {
        instance.state = observe(state)
      }
    }
    return instance.state
  }
}