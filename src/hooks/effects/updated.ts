import bus from '../../utils/effect-bus'
import Dependency from '../../observer/dependeny'

export default function onUpdated(callback: () => void) {
  if (!Dependency.target) {
    throw new Error('please invoke onUpdated at top level in a component')
  } else {
    const instance = Dependency.target.instance
    // if the component is mounting, it won't have an id
    // when it's mounted, add the updated hook
    if (!instance.id) {
      bus.on('mounted', () => bus.on(`updated:${instance.id}`, callback))
    }
  }
}