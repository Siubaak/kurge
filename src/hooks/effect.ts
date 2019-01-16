import Dependency from '../observer/dependeny'
import { Effect } from '../common/types'
import emitter from '../utils/emitter'
import { is } from '../utils'

export default function useEffect(effect: Effect) {
  if (!Dependency.target) {
    throw new Error('please call useEffect at top level in a component')
  } else {
    const instance = Dependency.target.instance
    if (instance.id) {
      // if the component has been mounted, it has an id
      // invoke effect when updated, and remove cleanup then add it again
      emitter.on(`updated:${instance.id}`, () => {
        const cleanup = effect()
        emitter.clean(`unmount:${instance.id}`)
        if (cleanup && is.function(cleanup)) {
          emitter.on(`unmount:${instance.id}`, cleanup)
        }
      })
    } else {
      // if the component is mounting, it won't have an id
      // invoke effect when mounted, then add it again
      // no needs to remove cleanup first because it's mounting
      emitter.on('mounted', () => {
        const cleanup = effect()
        if (cleanup && is.function(cleanup)) {
          emitter.on(`unmount:${instance.id}`, cleanup)
        }
      })
    }
  }
}