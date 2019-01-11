import { is, hasOwn } from '../utils/index'
import Dependency from './dependeny'

export default function observe(data: any) {
  if (!is.object(data) && !is.array(data)) {
    throw new TypeError('Data must be object or array')
  }
  const dep: Dependency = new Dependency()
  return new Proxy(data, {
    get(target, property, receiver) {
      if (hasOwn(target, property)) {
        // collect dependencies
        if (Dependency.target) {
          dep.collect()
        }
      }
      return Reflect.get(target, property, receiver)
    },
    set(target, property, value, receiver) {
      if (hasOwn(target, property) || is.undefined(target[property])) {
        if (value !== target[property]) {
          dep.notify()
        }
      }
      return Reflect.set(target, property, value, receiver)
    },
    deleteProperty(target, property) {
      if (hasOwn(target, property)) {
        // notify watchers
        dep.notify()
      }
      return Reflect.deleteProperty(target, property)
    }
  })
}