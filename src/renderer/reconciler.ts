import emitter from '../utils/emitter'
import { nextTick } from '../utils'
import { Elem, Instance, Update, IdleDeadline } from '../shared/types'
import ComponentInstance from '../instances/component'

// dirty instance set 
class DirtyList {
  private readonly map: { [ id: string ]: Update[] } = {}
  private readonly arr: string[] = []
  get first(): Update[] {
    return this.map[this.arr[0]]
  }
  push(componentInst: ComponentInstance): void {
    const id: string = componentInst.id
    if (!this.map[id]) {
      this.arr.push(id)
    }
    this.map[id] = [{ instance: componentInst, element: null }]
  }
  shift(): void {
    delete this.map[this.arr.shift()]
  }
}

// reconciler for async update, and avoid multiple updates of the same instance
// mount and unmount is sync, and only update is async
class Reconciler {
  private readonly dirtyList = new DirtyList()
  private isBatchUpdating: boolean = false

  enqueueSetState(componentInst: ComponentInstance): void {
    this.dirtyList.push(componentInst)
    // if it's not batch updating, begin
    if (!this.isBatchUpdating) {
      this.runBatchUpdate()
    }
  }

  enqueueUpdate(instance: Instance, element: Elem): void {
    this.dirtyList.first.push({ instance, element })
  }

  private runBatchUpdate() {
    this.isBatchUpdating = true
    const batchUpdate = (deadline: IdleDeadline) => {
      while (deadline.timeRemaining() > 0 && this.dirtyList.first) {
        if (this.dirtyList.first.length) {
          const { instance, element } = this.dirtyList.first.shift()
          // check id to prevent the instance has been unmounted before updating
          if (instance.id) {
            instance.update(element)
            if (instance instanceof ComponentInstance) {
              emitter.on('updated', () => {
                if (instance.node) {
                  emitter.emit(`updated:${instance.id}`)
                }
              })
            }
          }
        } else {
          this.dirtyList.shift()
        }
      }
      if (this.dirtyList.first) {
        // if reconciler still has dirty instance which needs to be updated
        // but no time left for updating, wait for the next tick
        nextTick(batchUpdate)
      } else {
        this.isBatchUpdating = false
      }
      emitter.emit('updated')
    }
    nextTick(batchUpdate)
  }
}

export default new Reconciler()