import Dependency from '../observer/dependeny'
import { Effect } from '../shared/types'
import emitter from '../utils/emitter'
import { is } from '../utils'

export default function useEffect(effect: Effect, guard: any[] = null) {
  if (!is.null(guard) && !is.array(guard)) {
    throw new Error('the second argument of useEffect only accepts array')
  } else if (!Dependency.target) {
    throw new Error('please call useEffect at top level in a component')
  } else {
    const instance = Dependency.target.instance
    if (instance.node) {
      // if the component has been mounted, it has a node
      const prevGuard = instance.prevGuard

      if (is.undefined(prevGuard)) {
        throw new Error('unmatch any effects, please don\'t call useEffect in if/loop statement')
      }

      let shouldCall = false
      if (is.array(guard) && is.array(prevGuard) && guard.length === prevGuard.length) {
        for (let i = 0; i < guard.length; i++) {
          if (guard[i] !== prevGuard[i]) {
            shouldCall = true
          }
        }
      } else {
        shouldCall = true
      }

      if (shouldCall) {
        emitter.on(`updated:${instance.id}`, () => {
          // invoke effect when updated, and remove cleanup then add it again
          emitter.clean(`unmount:${instance.id}`)
          const cleanup = effect()
          if (cleanup && is.function(cleanup)) {
            emitter.on(`unmount:${instance.id}`, cleanup)
          }
        })
      }
    } else {
      // if the component is mounting, it won't have a node
      // invoke effect when mounted, then add it again
      emitter.on('mounted', () => {
        // if no node, it may not mounted correctly
        if (instance.node) {
          // no needs to remove cleanup first because it's mounting
          const cleanup = effect()
          if (cleanup && is.function(cleanup)) {
            emitter.on(`unmount:${instance.id}`, cleanup)
          }
        }
      })
    }
    instance.guards.push(guard)
  }
}