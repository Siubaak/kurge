class Bus {
  private listeners: { [event: string]: (() => void)[] } = {}

  on(event: string, callback: () => void) {
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }
    this.listeners[event].push(callback)
  }

  emit(event: string) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback())
    }
  }

  clean(event: string) {
    delete this.listeners[event]
  }
}

export default new Bus()