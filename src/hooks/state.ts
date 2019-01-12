import observe from '../observer/index'
import Dependency from '../observer/dependeny'

export default function useState(state: any) {
  if (!Dependency.target) {
    throw new Error('please invoke useState at top level in a component')
  } else {
    const instance = Dependency.target.instance
    // if the component is mounting, it won't have an id
    if (!instance.id) {
      instance.state = observe(state)
    }
    return instance.state
  }
}