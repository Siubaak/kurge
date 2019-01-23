import { is, setProto, getProto } from '../../utils'
import Dependency from '../dependeny'
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

// simple proxy polyfill for observer
class ProxyPolyfill {
  constructor(target: any, handler: ProxyHandler<any>) {
    const proxy: any = {}

    function getter(p: string) {
      return handler.get(this, p, proxy)
    }
    function setter(p: string, v: any) {
      handler.set(this, p, v, proxy)
    }

    const propertyMap: { [key: string]: any } = {}
    Object.getOwnPropertyNames(target).forEach((prop: string) => {
        const descriptor = Object.getOwnPropertyDescriptor(target, prop)
        Object.defineProperty(proxy, prop, {
          configurable: descriptor.configurable,
          enumerable: descriptor.enumerable,
          get: getter.bind(target, prop),
          set: setter.bind(target, prop)
        })
        propertyMap[prop] = true
    })

    const proxyProto: any = Object.create(getProto(target))
    setProto(proxy, proxyProto)

    let proto = proxyProto
    if (is.array(target)) {
      mutatedMethods.forEach((method: string) => {
        propertyMap[method] = true
        Object.defineProperty(proto, method, {
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
                args[i] = observe(args[i], Dependency.target)
              }
            }
            return arrayProto[method].apply(this, args)
          },
          configurable: true,
          enumerable: false,
          writable: true
        })
      })
    }

    while (proto) {
      Object.getOwnPropertyNames(proto).forEach((prop: string) => {
        if (!propertyMap[prop]) {
          const descriptor = Object.getOwnPropertyDescriptor(proto, prop)
          Object.defineProperty(proxyProto, prop, {
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
    return proxy
  }
}

export default (window as any).Proxy || ProxyPolyfill