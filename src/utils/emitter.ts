class Emitter {
  private listeners: { [event: string]: (() => void)[] } = {}

  on(event: string, callback: () => void) {
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }
    this.listeners[event].push(callback)
  }

  emit(event: string) {
    if (this.listeners[event]) {
      for (let i = 0; i < this.listeners[event].length; i++) {
        this.listeners[event][i]()
      }
      this.clean(event)
    }
  }

  clean(event: string) {
    delete this.listeners[event]
  }
}

export default new Emitter()
