import { swap } from './index'

// binary heap for reconciler
export default class Heap<T> {
  private readonly arr: T[] = []
  private readonly compare: (contrast: T, self: T) => boolean

  constructor(compare: (contrast: T, self: T) => boolean) {
    this.compare = compare
  }
  get length(): number {
    return this.arr.length
  }

  push(item: T): void {
    this.arr.push(item)
    this.promote(this.arr.length - 1)
  }

  shift(): T {
    let m
    if (this.arr.length > 1) {
      m = this.arr[0]
      this.arr[0] = this.arr.pop()
      this.heapify(0)
    } else {
      m = this.arr.pop()
    }
    return m
  }

  private heapify(i: number): void {
    const l = this.left(i)
    const r = this.right(i)
    let m = i
    if (this.arr[l] && this.compare(this.arr[l], this.arr[i])) {
      m = l
    }
    if (this.arr[r] && this.compare(this.arr[r], this.arr[i])) {
      m = r
    }
    if (m !== i) {
      swap(this.arr[i], this.arr[m])
      this.heapify(m)
    }
  }

  private promote(i: number): void {
    let p = this.parent(i)
    while (this.arr[p] && this.compare(this.arr[p], this.arr[i])) {
      swap(this.arr[i], this.arr[p])
      i = p
      p = this.parent(i)
    }
  }

  private parent(i: number): number {
    return Math.floor((i + 1) / 2) - 1
  }

  private left(i: number): number {
    return 2 * (i + 1) - 1
  }

  private right(i: number): number {
    return 2 * (i + 1)
  }
}
