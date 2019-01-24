// simple reflect polyfill
const ReflectPolyfill = {
  get(target: any, property: string | number | symbol): any {
    return target[property]
  },
  set(target: any, property: string | number | symbol, value: any): boolean {
    target[property] = value
    return true
  },
  deleteProperty(target: any, property: string | number | symbol): boolean {
    return delete target[property]
  }
}

export default (window as any).Reflect || ReflectPolyfill