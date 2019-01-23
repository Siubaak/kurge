import observe from '..'
import { setProto, getProto, is } from '../../utils'
import { DEP_SYMBOL } from '../../shared/constants'

const mutatedMethods = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
]

// simple proxy polyfill for observer
class ProxyPolyfill {
  constructor(target: any, handler: ProxyHandler<any>) {
    const isArray: boolean = is.array(target)
    const proxy: any = {}

    function getter(p: string) {
      if (isArray && mutatedMethods.indexOf(p) > -1) {
        const origin = handler.get(target, p, proxy)
        return (...args: any[]) => {
          switch (p) {
            case 'push':
            case 'unshift':
              for (let i = 0; i < args.length; i++) {
                if (is.object(args[i]) || is.array(args[i])) {
                  args[i] = observe(args[i], handler.get(target, DEP_SYMBOL, proxy).specificWatcher)
                }
                const index = handler.get(target, 'length', proxy) + i
                Object.defineProperty(proxy, index, {
                  configurable: true,
                  enumerable: true,
                  get: getter.bind(target, index),
                  set: setter.bind(target, index)
                })
              }
              break
            case 'pop':
            case 'shift':
              delete proxy[handler.get(target, 'length', proxy) - 1]
              break
            case 'splice':
              const remove = args[1]
              for (let i = 2; i < args.length; i++) {
                if (is.object(args[i]) || is.array(args[i])) {
                  args[i] = observe(args[i], handler.get(target, DEP_SYMBOL, proxy).specificWatcher)
                }
              }
              for (let i = 0; i < remove; i++) {
                delete proxy[handler.get(target, 'length', proxy) - 1 - i]
              }
              break
          }
          const result: any = origin.apply(target, args)
          handler.get(target, DEP_SYMBOL, proxy).notify()
          return result
        }
      } else {
        return handler.get(target, p, proxy)
      }
    }
    function setter(p: string, v: any) {
      handler.set(target, p, v, proxy)
    }

    const propertyMap = Object.create(null)
    let proto = target
    while (proto) {
      Object.getOwnPropertyNames(proto).forEach((prop: string) => {
        if (!propertyMap[prop]) {
          const descriptor = Object.getOwnPropertyDescriptor(proto, prop)
          Object.defineProperty(proxy, prop, {
            configurable: descriptor.configurable,
            enumerable: descriptor.enumerable,
            get: getter.bind(target, prop),
            set: setter.bind(target, prop)
          })
          propertyMap[prop] = true
        }
      })
      proto = getProto(proto)
    }

    setProto(proxy, getProto(target))

    return proxy
  }
}

if (!(window as any).Proxy) {
  console.warn('Proxy isn\'t natively supported, and Kurge will use built-in polyfill instead')
}

export default (window as any).Proxy || ProxyPolyfill