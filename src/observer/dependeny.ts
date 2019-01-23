import Watcher from './watcher'
import { delArrItem } from '../utils'

let uid: number = 0

export default class Dependency {
  static target: Watcher = null

  readonly id: number = uid++
  readonly list: Watcher[] = []
  readonly specificWatcher: Watcher

  constructor(specificWatcher: Watcher = null) {
    this.specificWatcher = specificWatcher
  }

  // subscribe a watcher to this dependency
  subscribe(watcher: Watcher) {
    this.list.push(watcher)
  }

  // unsubscribe a watcher to this dependency
  unsubscribe(watcher: Watcher) {
    delArrItem(this.list, watcher)
  }

  // collect this dependency into the target watcher dependency list
  // and build relation between this dependency and the target watcher
  // if this dependency has specific watcher, only collect the relative watcher
  collect() {
    if (
      Dependency.target &&
      (
        !this.specificWatcher ||
        this.specificWatcher && this.specificWatcher === Dependency.target
      )
    ) {
      Dependency.target.depend(this)
    }
  }

  // notify the update of this dependency
  notify() {
    for (let i = 0; i < this.list.length; i++) {
      this.list[i].update()
    }
  }
}

const targetStack: Watcher[] = []

export function pushTarget(target: Watcher) {
  targetStack.push(target)
  Dependency.target = target
}

export function popTarget() {
  targetStack.pop()
  Dependency.target = targetStack[targetStack.length - 1]
}