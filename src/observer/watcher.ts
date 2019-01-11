import Dependency from './dependeny'
import { Instance } from '../common/types'
import { swap } from '../utils/index'
import reconciler from '../renderer/reconciler'

let uid: number = 0

export default class Watcher {
  readonly id: number = uid++
  readonly instance: Instance
  depIds: Set<number> = new Set()
  newDepIds: Set<number> = new Set()
  list: Dependency[] = []
  newList: Dependency[] = []

  constructor(instance: Instance) {
    this.instance = instance
  }

  // add a dependency to this watcher and subscribe the dependency
  // this method will be excute by the dependency
  depend(dep: Dependency) {
    const id = dep.id
    if (!this.newDepIds.has(id)) {
      this.newDepIds.add(id)
      this.newList.push(dep)
      if (!this.depIds.has(id)) {
        dep.subscribe(this)
      }
    }
  }

  // clean up all dependencies and unsubscribe this watcher
  cleanUp() {
    let i = this.list.length
    while (i--) {
      const dep = this.list[i]
      if (!this.newDepIds.has(dep.id)) {
        dep.unsubscribe(this)
      }
    }
    swap(this.depIds, this.newDepIds)
    this.newDepIds.clear()
    swap(this.list, this.newList)
    this.newList.length = 0
  }

  // update caused by dependencies
  update() {
    reconciler.enqueueUpdate(this.instance)
  }
}