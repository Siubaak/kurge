import emitter from '../utils/emitter'
import { nextTick, is } from '../utils'
import { Elem, Instance, Update, IdleDeadline } from '../shared/types'
import ComponentInstance from '../instances/component'
import { PRIORITY } from '../shared/constants'

// dirty instance set 
class DirtyList {
  private readonly arr: Update[] = []
  get current(): { instance: Instance, element: Elem }[] {
    return this.arr[0] && this.arr[0].current
  }
  insert(componentInst: ComponentInstance, priority: number): void {
    let find = false
    const id = componentInst.id
    if (this.arr.length) {
      for (let i = 0; i < this.arr.length; i++) {
        if (this.arr[i].id === id) {
          this.arr[i] = {
            id,
            priority,
            current: [{ instance: componentInst, element: null }]
          }
          find = true
          break
        }
      }
    }
    if (!find) {
      this.arr.push({
        id,
        priority,
        current: [{ instance: componentInst, element: null }]
      })
    }
    this.arr.sort((a, b) => a.priority - b.priority)
  }
  shift(): Update {
    return this.arr.shift()
  }
}

// reconciler for async update, and avoid multiple updates of the same instance
// mount and unmount is sync, and only update is async
class Reconciler {
  private readonly dirtyList = new DirtyList()
  private isBatchUpdating: boolean = false

  priority: number = PRIORITY.NORMAL

  enqueueSetState(componentInst: ComponentInstance): void {
    this.dirtyList.insert(componentInst, this.priority)
    // if it's not batch updating, begin
    if (!this.isBatchUpdating) {
      this.runBatchUpdate()
    }
  }

  enqueueUpdate(instance: Instance, element: Elem): void {
    if (this.dirtyList.current) {
      this.dirtyList.current.push({ instance, element })
    }
  }

  private runBatchUpdate() {
    this.isBatchUpdating = true
    const batchUpdate = (deadline: IdleDeadline) => {
      while (deadline.timeRemaining() > 0 && this.dirtyList.current) {
        if (this.dirtyList.current.length) {
          const { instance, element } = this.dirtyList.current.shift()
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
      if (this.dirtyList.current) {
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

const reconciler = new Reconciler()

export default reconciler

// override common task function to promote priority
;(window as any)._requestAnimationFrame = window.requestAnimationFrame
window.requestAnimationFrame = function requestAnimationFrame(
  callback: FrameRequestCallback
): number {
  return (window as any)._requestAnimationFrame(function () {
    reconciler.priority = PRIORITY.ANIMATION
    callback.apply(this, arguments)
    reconciler.priority = PRIORITY.NORMAL
  })
}

;(window as any)._setTimeout = window.setTimeout
window.setTimeout = function setTimeout(
  handler: TimerHandler,
  timeout?: number,
  ...args: any[]
): number {
  if (is.string(handler)) {
    handler = new Function(handler as string)
  }
  return (window as any)._setTimeout(function () {
    reconciler.priority = PRIORITY.TASK
    ;(handler as Function).apply(this, arguments)
    reconciler.priority = PRIORITY.NORMAL
  }, timeout, ...args)
}

;(window as any)._setInterval = window.setInterval
window.setInterval = function setInterval(
  handler: TimerHandler,
  timeout?: number,
  ...args: any[]
): number {
  if (is.string(handler)) {
    handler = new Function(handler as string)
  }
  return (window as any)._setInterval(function () {
    reconciler.priority = PRIORITY.TASK
    ;(handler as Function).apply(this, arguments)
    reconciler.priority = PRIORITY.NORMAL
  }, timeout, ...args)
}