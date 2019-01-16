class Emitter {
  private listeners: { [event: string]: (() => void)[] } = {}

  on(event: string, callback: () => void) {
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }
    this.listeners[event].push(callback)
  }

  emit(event: string, reverse: boolean = false) {
    if (this.listeners[event]) {
      if (reverse) {
        for (let i = this.listeners[event].length - 1; i > -1; i--) {
          this.listeners[event][i]()
        }
      } else {
        for (let i = 0; i < this.listeners[event].length; i++) {
          this.listeners[event][i]()
        }
      }
      this.clean(event)
    }
  }

  clean(event: string) {
    delete this.listeners[event]
  }
}

export default new Emitter()
