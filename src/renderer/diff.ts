import { Elem, VDomNode, Instance, Patches, PatchOp } from '../shared/types'
import { instantiate } from '../renderer'
import { createNode } from '../utils/dom'
import reconciler from './reconciler'
import emitter from '../utils/emitter'

// diff two array, and return the least operations to modify
// use both frontward diff and backward diff, and return the less modify operation of them
// this function will update ref of prevInstances
export function diff(prevInstances: Instance[], nextChildren: Elem[]): Patches {
  // create map by key or index, to make sure O(1) retrieve 
  const prevInstanceMap: { [key: string]: Instance } = {}
  prevInstances.forEach((inst: Instance) => prevInstanceMap[inst.key] = inst)
  // save instances corresponding to nextChildren
  const nextInstances: Instance[] = []
  // traversal nextChildren
  nextChildren.forEach((nextChild: Elem, index: number) => {
    // get key, if none, assign an index
    const key = (nextChild as VDomNode).key != null
      ? 'k_' + (nextChild as VDomNode).key
      : '' + index
    // get previous instance
    const prevInstance: Instance = prevInstanceMap[key]
    if (prevInstance && prevInstance.same(nextChild)) {
      // if previous instance exists and vdom is same, just update
      reconciler.enqueueUpdate(prevInstance, nextChild)
      nextInstances.push(prevInstance)
    } else {
      const nextInstance = instantiate(nextChild)
      nextInstances.push(nextInstance)
    }
  })
  // patches of forward diff
  const forwardOps: PatchOp[] = []
  // patches of backward diff
  const backwardOps: PatchOp[] = []
  // take the rightmost position of resumed node in previous node list as fixed point
  let lastForwardIndex: number = -1
  // take the leftmost position of resumed node in previous node list as fixed point
  let lastBackwardIndex: number = prevInstances.length
  for (let index: number = 0; index < nextInstances.length; index++) {
    // forward diff
    const forwardNextInstance = nextInstances[index]
    const forwardPrevInstance = prevInstanceMap[forwardNextInstance.key]
    // check if nodes are same
    if (forwardPrevInstance === forwardNextInstance) {
      // same, and move it after the fixed point
      if (forwardPrevInstance.index < lastForwardIndex) {
        forwardOps.push({
          type: 'move',
          inst: forwardPrevInstance,
          index: lastForwardIndex
        })
      }
      // update fixed point
      lastForwardIndex = Math.max(forwardPrevInstance.index, lastForwardIndex)
    } else {
      // not same, and insert a new node. remove if previous node exists
      if (forwardPrevInstance) {
        forwardOps.push({
          type: 'remove',
          inst: forwardPrevInstance
        })
      }
      forwardOps.push({
        type: 'insert',
        inst: forwardNextInstance,
        index: lastForwardIndex
      })
    }
    // backward diff
    const backwardNextInstance = nextInstances[nextInstances.length - index - 1]
    const backwardPrevInstance = prevInstanceMap[backwardNextInstance.key]
    // same as forward diff, but fixed point and diff direction are reversed
    if (backwardPrevInstance === backwardNextInstance) {
      if (backwardPrevInstance.index > lastBackwardIndex) {
        backwardOps.push({
          type: 'move',
          inst: backwardPrevInstance,
          index: lastBackwardIndex
        })
      }
      lastBackwardIndex = Math.min(backwardPrevInstance.index, lastBackwardIndex)
    } else {
      if (backwardPrevInstance) {
        backwardOps.push({
          type: 'remove',
          inst: backwardPrevInstance
        })
      }
      backwardOps.push({
        type: 'insert',
        inst: backwardNextInstance,
        index: lastBackwardIndex
      })
    }
  }
  // create map to make sure O(1) retrieve
  const nextInstanceMap: { [key: string]: Instance } = {}
  nextInstances.forEach((inst: Instance) => {
    if (nextInstanceMap[inst.key]) {
      // duplicate keys
      console.warn('Find duplicate keys in a list. '
        + 'Please offer unique keys for list items '
        + 'or rendering this list may meet some error')
    }
    nextInstanceMap[inst.key] = inst
  })
  // remove unnecessary nodes in prevInstances
  for (const key in prevInstanceMap) {
    if (!nextInstanceMap[key]) {
      forwardOps.push({
        type: 'remove',
        inst: prevInstanceMap[key]
      })
      backwardOps.push({
        type: 'remove',
        inst: prevInstanceMap[key]
      })
    }
  }
  // update index
  nextInstances.forEach((nextInstance: Instance, index: number) => nextInstance.index = index)
  // update childInstances, and assign length to be zero to avoid lossing ref
  prevInstances.length = 0
  prevInstances.push(...nextInstances)
  // return the least patches
  return forwardOps.length < backwardOps.length
    ? { ops: forwardOps, dir: 'forward' }
    : { ops: backwardOps, dir: 'backward' }
}

// patch the previous nodes
export function patch(parentInst: Instance, patches: Patches): void {
  const container: HTMLElement = parentInst.node as HTMLElement
  const { ops, dir } = patches
  // offset of before node caused by inserting node in forward diff
  let insertNum: number = 0
  ops.forEach((op: PatchOp) => {
    // calculate index of the node for insertBefore
    const beforeIndex: number = dir === 'forward' ? op.index + 1 + insertNum : op.index
    if (op.type === 'remove') {
      // unmount
      op.inst.unmount()
    } else {
      if (op.type === 'insert') {
        // insert, and use createNode to create dom node
        insertNum++
        const markup: string = op.inst.mount(`${parentInst.id}:${op.inst.key}`)
        const node = createNode(markup)
        const beforeNode = container.children[beforeIndex]
        // insertBefore will degenerate to be appendChild if beforeNode is undefined
        container.insertBefore(node, beforeNode)
        emitter.emit('loaded')
        emitter.emit('mounted')
      } else {
        // move, and getting the node needed to be moved is enough
        const node = op.inst.node
        const beforeNode = container.children[beforeIndex]
        // insertBefore will degenerate to be appendChild if beforeNode is undefined
        container.insertBefore(node, beforeNode)
      }
    }
  })
}
