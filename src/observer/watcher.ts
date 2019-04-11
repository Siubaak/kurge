import Dependency from './dependeny'
import reconciler from '../renderer/reconciler'
import ComponentInstance from '../instances/component'

let wid: number = 0

export default class Watcher {
  readonly id: number = wid++
  readonly instance: ComponentInstance
  depIds: { [id: string]: boolean } = {}
  newDepIds: { [id: string]: boolean } = {}
  list: Dependency[] = []
  newList: Dependency[] = []
  
  constructor(instance: ComponentInstance) {
    this.instance = instance
  }

  // add a dependency to this watcher and subscribe the dependency
  // this method will be excute by the dependency
  depend(dep: Dependency) {
    const id = dep.id
    if (!this.newDepIds[id]) {
      this.newDepIds[id] = true
      this.newList.push(dep)
      if (!this.depIds[id]) {
        dep.subscribe(this)
      }
    }
  }

  // clean up all dependencies and unsubscribe this watcher
  clean() {
    let i = this.list.length
    while (i--) {
      const dep = this.list[i]
      if (!this.newDepIds[dep.id]) {
        dep.unsubscribe(this)
      }
    }
    [this.depIds, this.newDepIds] = [this.newDepIds, this.depIds]
    this.newDepIds = {};
    [this.list, this.newList] = [this.newList, this.list]
    this.newList.length = 0
  }

  // update caused by dependencies
  update() {
    reconciler.enqueueSetState(this.instance)
  }
}