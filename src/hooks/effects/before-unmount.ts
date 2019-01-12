import bus from '../../utils/effect-bus'
import Dependency from '../../observer/dependeny'

export default function onBeforeUnMount(callback: () => void) {
  if (!Dependency.target) {
    throw new Error('please invoke onBeforeUnMount at top level in a component')
  } else {
    const instance = Dependency.target.instance
    // if the component has been mounted, it will have an id
    if (instance.id) {
      bus.on(`before-unmount:${instance.id}`, callback)
    }
  }
}