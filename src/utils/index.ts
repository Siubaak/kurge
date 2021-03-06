import { IdleCallback } from '../shared/types'
import { PRIORITY } from '../shared/constants'
import reconciler from '../renderer/reconciler'

// strict type validators
const _toString = Object.prototype.toString
export const is = {
  undefined: (val: any) => _toString.call(val) === '[object Undefined]',
  null: (val: any) => _toString.call(val) === '[object Null]',
  number: (val: any) => _toString.call(val) === '[object Number]',
  string: (val: any) => _toString.call(val) === '[object String]',
  boolean: (val: any) => _toString.call(val) === '[object Boolean]',
  symbol: (val: any) => _toString.call(val) === '[object Symbol]',
  regexp: (val: any) => _toString.call(val) === '[object RegExp]',
  object: (val: any) => _toString.call(val) === '[object Object]',
  array: (val: any) => _toString.call(val) === '[object Array]',
  function: (val: any) => _toString.call(val) === '[object Function]'
}

// has own property
const _hasOwn = Object.prototype.hasOwnProperty
export function hasOwn(object: any, property: string | number | symbol) {
  return _hasOwn.call(object, property)
}

// delete array specified item
export function delArrItem(arr: any[], item: any): any[] | void {
  if (arr.length) {
    const index = arr.indexOf(item)
    if (index > -1) {
      return arr.splice(index, 1)
    }
  }
}

// simple requestIdleCallback polyfill
function requestIdleCallbackPolyfill(callback: IdleCallback) {
  const start = Date.now()
  return requestAnimationFrame(() => {
    callback({
      timeRemaining: () => Math.max(0, 50 - (Date.now() - start))
    })
  })
}
export const nextTick: (callback: IdleCallback) => number
  = (window as any).requestIdleCallback || requestIdleCallbackPolyfill

// polyfill of getPrototypeOf
export function getProto(object: any): any {
  return Object.getPrototypeOf(object) || object.__proto__ || null
}

// polyfill of setPrototypeOf
export function setProto(object: any, proto: any): boolean {
  if ((Object as any).setPrototypeOf) {
    (Object as any).setPrototypeOf(object, proto)
    return true
  } else if (object.__proto__) {
    object.__proto__ = proto
    return true
  } else {
    return false
  }
}

// wrap event handler to promote priority
export function eventHandlerWrapper(eventHandler: (...args: any[]) => void) {
  return function () {
    reconciler.priority = PRIORITY.EVENT
    eventHandler.apply(this, arguments)
    reconciler.priority = PRIORITY.TASK
  }
}