import observe from '../observer/index'
import Dependency from '../observer/dependeny'
import { PROXY_TARGET } from '../common/constants'

export default function useState(state: any) {
  if (!Dependency.target) {
    throw new Error('please invoke useState at top level in a component')
  } else {
    const instance = Dependency.target.instance
    // if the component is mounting, it won't have an id
    if (!instance.id) {
      // merge duplicate states when invoke useState multiple times in a same component
      if (instance.state) {
        Object.assign(instance.state[PROXY_TARGET], state)
      } else {
        instance.state = observe(state)
      }
    }
    return instance.state
  }
}