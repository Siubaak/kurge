import Heap from '../utils/heap'
import bus from '../utils/effect-bus'
import { nextTick } from '../utils/index'
import { Elem, Instance, DirtyInstance } from '../common/types'
import ComponentInstance from '../instances/component'

// dirty instance set 
class DirtyInstanceSet {
  private readonly map: { [ id: string ]: DirtyInstance } = {}
  private readonly arr: Heap<string> = new Heap(
    (contrast: string, self: string) =>
      contrast.split(':').length > self.split(':').length
  )
  get length(): number {
    return this.arr.length
  }
  push(dirtyInstance: DirtyInstance): void {
    const id: string = dirtyInstance.instance.id
    if (!this.map[id]) {
      this.arr.push(id)
    }
    this.map[id] = dirtyInstance
  }
  shift(): DirtyInstance {
    const id = this.arr.shift()
    const dirtyInstance = this.map[id]
    delete this.map[id]
    return dirtyInstance
  }
}

// reconciler for async update, and avoid multiple updates of the same instance
// mount and unmount is sync, and only update is async
class Reconciler {
  private readonly dirtyInstanceSet = new DirtyInstanceSet() 
  private isBatchUpdating: boolean = false

  enqueueUpdate(instance: Instance, element: Elem = null): void {
    this.dirtyInstanceSet.push({ instance, element })
    // if it's not batch updating, begin
    if (!this.isBatchUpdating) {
      this.runBatchUpdate()
    }
  }

  private runBatchUpdate() {
    this.isBatchUpdating = true
    nextTick(() => {
      while (this.dirtyInstanceSet.length) {
        const { instance, element } = this.dirtyInstanceSet.shift()
        // check id to prevent the instance has been unmounted before updating
        if (instance.id) {
          if (instance instanceof ComponentInstance) {
            bus.emit(`before-update:${instance.id}`)
          }
          instance.update(element)
          if (instance instanceof ComponentInstance) {
            bus.on('updated', () => bus.emit(`updated:${instance.id}`))
          }
        }
      }
      this.isBatchUpdating = false
      bus.emit('updated', true)
      bus.clean('updated')
    })
  }
}

export default new Reconciler()