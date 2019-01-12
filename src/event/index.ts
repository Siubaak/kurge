import { DATA_ID, SUPPORTED_EVENTS } from '../common/constants'
import { getParentId } from '../utils/dom'

// delegated listener set. mount all listener on document node
class EventListenerSet {
  private readonly _eventListeners:  {
    [ key: string ]: {
      [ event: string ]: (e: Event) => void
    }
  } = {}
  constructor() {
    if (document) {
      SUPPORTED_EVENTS.forEach((event: string) => {
        document.addEventListener(event, (e: Event) => {
          let id = (e.target as HTMLElement).getAttribute
            && (e.target as HTMLElement).getAttribute(DATA_ID)
          while (id) {
            const eventListener: (e: Event) => void =
              this._eventListeners[id] && this._eventListeners[id][event]
            if (eventListener) {
              eventListener(e)
            }
            id = getParentId(id)
          }
        })
      })
    }
  }
  get(id: string, event: string): (e: Event) => void {
    return this._eventListeners[id][event]
  }
  set(id: string, event: string, eventListener: (e: Event) => void): void {
    if (!this._eventListeners[id]) {
      this._eventListeners[id] = {}
    }
    this._eventListeners[id][event] = eventListener
  }
  remove(id: string, event: string): void {
    if (this._eventListeners[id]) {
      delete this._eventListeners[id][event]
    }
  }
  clean(id: string): void {
    delete this._eventListeners[id]
  }
}

export default new EventListenerSet()