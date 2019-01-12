import bus from '../../utils/effect-bus'
import Dependency from '../../observer/dependeny'

export default function onMounted(callback: () => void) {
  if (!Dependency.target) {
    throw new Error('please invoke onMounted at top level in a component')
  } else {
    const instance = Dependency.target.instance
    // if the component is mounting, it won't have an id
    if (!instance.id) {
      bus.on('mounted', callback)
    }
  }
}