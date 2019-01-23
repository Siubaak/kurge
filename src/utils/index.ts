import { IdleCallback } from '../shared/types'

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
export function nextTick(callback: IdleCallback) {
  if ((window as any).requestIdleCallback) {
    return (window as any).requestIdleCallback(callback)
  }
  const start = Date.now()
  return requestAnimationFrame(function () {
    callback({
      timeRemaining: () => Math.max(0, 50 - (Date.now() - start))
    })
  })
}