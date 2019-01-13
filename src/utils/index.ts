const _toString = Object.prototype.toString

// strict type validators
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

const _hasOwn = Object.prototype.hasOwnProperty

// has own property
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

// swap any two items
export function swap(a: any, b: any) { [a, b] = [b, a] }

// push the callback to next frame event loop
export const nextTick = requestAnimationFrame
