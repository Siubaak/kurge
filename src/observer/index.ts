import { is, hasOwn } from '../utils'
import Dependency from './dependeny'
import Watcher from './watcher'

export default function observe(data: any, specificWatcher: Watcher = null) {
  if (is.function(data)) {
    throw new Error('function can\'t be observed')
  } else if (!is.object(data) && !is.array(data)) {
    data = { value: data }
  }
  for (const key in data) {
    if (hasOwn(data, key)) {
      if (is.object(data[key]) || is.array(data[key])) {
        data[key] = observe(data[key], specificWatcher)
      }
    }
  }
  const dep: Dependency = new Dependency(specificWatcher)
  return new Proxy(data, {
    get(target, property) {
      if (hasOwn(target, property)) {
        // collect dependencies
        dep.collect()
      }
      return target[property]
    },
    set(target, property, value) {
      if (
        (hasOwn(target, property) || is.undefined(target[property])) &&
        value !== target[property]
      ) {
        // notify watchers
        dep.notify()
      }
      target[property] = value
      return true
    },
    deleteProperty(target, property) {
      if (hasOwn(target, property)) {
        // notify watchers
        dep.notify()
      }
      return delete target[property]
    }
  })
}