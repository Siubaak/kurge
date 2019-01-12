import bus from '../../utils/effect-bus'
import Dependency from '../../observer/dependeny'

export default function onBeforeUnMount(callback: () => void) {
  if (!Dependency.target) {
    throw new Error('please invoke onBeforeUnMount at top level in a component')
  } else {
    const instance = Dependency.target.instance
    // if the component is mounting, it won't have an id
    // when it's mounted, add the before-unmount hook
    if (!instance.id) {
      bus.on('mounted', () => bus.on(`before-unmount:${instance.id}`, callback))
    }
  }
}