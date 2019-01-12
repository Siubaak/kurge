import Dependency from '../../observer/dependeny'

export default function onBeforeMount(callback: () => void) {
  if (!Dependency.target) {
    throw new Error('please invoke onBeforeMount at top level in a component')
  } else {
    const instance = Dependency.target.instance
    // if the component is mounting, it won't have an id
    if (!instance.id) {
      callback()
    }
  }
}