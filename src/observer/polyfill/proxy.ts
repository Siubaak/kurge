import { is, setProto } from '../../utils'
import observe from '..'

const arrayProto: any = Array.prototype

const mutatedMethods = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
]

function createMutatedArray(handler: ProxyHandler<any>): any[] {
  const mutatedArray: any[] = []
  Object.defineProperty(mutatedArray, '__updateId__', {
    value: 0,
    enumerable: false,
    configurable: true,
    writable: true
  })
  const mutatedArrayProto: any = Object.create(arrayProto)
  setProto(mutatedArray, mutatedArrayProto)
  mutatedMethods.forEach((method: string) => {
    Object.defineProperty(mutatedArrayProto, method, {
      value(...args: any[]) {
        let observeStart: number = null
        switch (method) {
          case 'push':
          case 'unshift':
            observeStart = 0
            break
          case 'splice':
            observeStart = 2
            break
        }
        if (is.number(observeStart)) {
          for (let i = observeStart; i < args.length; i++) {
            args[i] = observe(args[i])
          }
        }
        console.log(1)
        handler.set(mutatedArray, '__updateId__', (mutatedArray as any).__updateId__++, null)
        return arrayProto[method].apply(this, args)
      },
      configurable: true,
      enumerable: false,
      writable: true
    })
  })
  return mutatedArray
}

// simple proxy polyfill for observer
class ProxyPolyfill {
  constructor(target: any, handler: ProxyHandler<any>) {
    const isArray = is.array(target)
    const proxy: any = isArray ? createMutatedArray(handler) : {}
    const propertyMap: { [key: string]: any } = {}

    const getter = function(p: string) {
      return handler.get(this, p, proxy)
    }
    const setter = function(p: string, v: any) {
      handler.set(this, p, v, proxy)
    }
    console.log(Object.getOwnPropertyNames(target))
    Object.getOwnPropertyNames(target).forEach((prop: string) => {
      const oriDescriptor = Object.getOwnPropertyDescriptor(target, prop)
      if (oriDescriptor.configurable) {
        Object.defineProperty(proxy, prop, {
          enumerable: !!oriDescriptor.enumerable,
          get: getter.bind(target, prop),
          set: setter.bind(target, prop)
        })
      }
      propertyMap[prop] = true
    })

    const targetProto = Object.getPrototypeOf ? Object.getPrototypeOf(target) : target.__proto__
    let prototypeOk = false
    if (isArray) {
      const mutatedArrayProto = Object.getPrototypeOf ? Object.getPrototypeOf(proxy) : proxy.__proto__
      prototypeOk = setProto(mutatedArrayProto, targetProto)
    } else {
      prototypeOk = setProto(proxy, targetProto)
    }
    if (handler.get || !prototypeOk) {
      for (const key in target) {
        if (!propertyMap[key]) {
          Object.defineProperty(proxy, key, { get: getter.bind(target, key) })
        }
      }
    }
    return proxy
  }
}

export default (window as any).Proxy || ProxyPolyfill