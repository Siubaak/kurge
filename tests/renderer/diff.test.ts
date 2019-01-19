import Kurge from '../../src'
import { VDomNode } from '../../src/shared/types'
import { diff, patch } from '../../src/renderer/diff'
import DOMInstance from '../../src/instances/dom'
import emitter from '../../src/utils/emitter'

describe('test/diff.test.js', () => {
  const h = Kurge.createElement
  const oldList = getListEleArr([1, 2, 3, 4, 5])

  function getListEleArr(list: number[]): VDomNode[] {
    return list.map(i => h('div', { key: i }, i))
  }
  function getListInstArr(list: VDomNode[]): DOMInstance[] {
    return list.map((ele, index) => {
      const inst = new DOMInstance(ele)
      inst.index = index
      return inst
    })
  }

  it('should diff out only one forward move patch', () => {
    const instList = getListInstArr(oldList)
    const inst = instList[0]
    const patches = diff(instList, getListEleArr([2, 3, 4, 5, 1]))

    expect(patches.dir).toBe('forward')
    expect(patches.ops.length).toBe(1)

    const patch = patches.ops[0]

    expect(patch.type).toBe('move')
    expect(patch.inst).toBe(inst)
    expect(patch.index).toBe(instList.length - 1)
  })

  it('should diff out only one backward move patch', () => {
    const instList = getListInstArr(oldList)
    const inst = instList[instList.length - 1]
    const patches = diff(instList, getListEleArr([5, 1, 2, 3, 4]))
    
    expect(patches.dir).toBe('backward')
    expect(patches.ops.length).toBe(1)

    const patch = patches.ops[0]

    expect(patch.type).toBe('move')
    expect(patch.inst).toBe(inst)
    expect(patch.index).toBe(0)
  })

  it('should diff out only one forward remove patch', () => {
    const instList = getListInstArr(oldList)
    const inst = instList[2]
    const patches = diff(instList, getListEleArr([1, 2, 4, 5]))
    
    expect(patches.dir).toBe('backward')
    expect(patches.ops.length).toBe(1)

    const patch = patches.ops[0]

    expect(patch.type).toBe('remove')
    expect(patch.inst).toBe(inst)
    expect(patch.index).toBeUndefined()
  })

  it('should diff out only one backward insert patch', () => {
    const instList = getListInstArr(oldList)
    const patches = diff(instList, getListEleArr([1, 2, 3, 4, 5, 6]))

    expect(patches.dir).toBe('backward')
    expect(patches.ops.length).toBe(1)

    const patch = patches.ops[0]

    expect(patch.type).toBe('insert')
    expect(patch.inst.key).toBe('k_6')
    expect(patch.index).toBe(5)
  })

  it('should diff and forward patch normally', () => {
    const rootInst = new DOMInstance(h('div', null, ...oldList)) 
    const markup = rootInst.mount('kg')
    document.body.innerHTML = markup
    const patches = diff((rootInst as any).childInstances, getListEleArr([3, 2, 4, 5, 1, 6]))

    expect(patches.dir).toBe('forward')
    expect(patches.ops.length).toBe(3)
    expect(patches.ops[0].type).toBe('move')
    expect(patches.ops[0].inst.key).toBe('k_2')
    expect(patches.ops[0].index).toBe(2)
    expect(patches.ops[1].type).toBe('move')
    expect(patches.ops[1].inst.key).toBe('k_1')
    expect(patches.ops[1].index).toBe(4)
    expect(patches.ops[2].type).toBe('insert')
    expect(patches.ops[2].inst.key).toBe('k_6')
    expect(patches.ops[2].index).toBe(4)

    emitter.emit('loaded')
    patch(rootInst, patches)
    const childNodes = rootInst.node.childNodes

    expect(childNodes.length).toBe(6)
    expect((childNodes[0] as any).textContent).toBe('3')
    expect((childNodes[1] as any).textContent).toBe('2')
    expect((childNodes[2] as any).textContent).toBe('4')
    expect((childNodes[3] as any).textContent).toBe('5')
    expect((childNodes[4] as any).textContent).toBe('1')
    expect((childNodes[5] as any).textContent).toBe('6')

    document.body.innerHTML = null
  })

  it('should diff and backward patch normally', () => {
    const rootInst = new DOMInstance(h('div', null, ...oldList)) 
    const markup = rootInst.mount('kg')
    document.body.innerHTML = markup
    const patches = diff((rootInst as any).childInstances, getListEleArr([5, 1, 2, 3]))

    expect(patches.dir).toBe('backward')
    expect(patches.ops.length).toBe(2)
    expect(patches.ops[0].type).toBe('move')
    expect(patches.ops[0].inst.key).toBe('k_5')
    expect(patches.ops[0].index).toBe(0)
    expect(patches.ops[1].type).toBe('remove')
    expect(patches.ops[1].inst.key).toBe('k_4')
    expect(patches.ops[1].index).toBeUndefined()

    emitter.emit('loaded')
    patch(rootInst, patches)
    const childNodes = rootInst.node.childNodes

    expect(childNodes.length).toBe(4)
    expect((childNodes[0] as any).textContent).toBe('5')
    expect((childNodes[1] as any).textContent).toBe('1')
    expect((childNodes[2] as any).textContent).toBe('2')
    expect((childNodes[3] as any).textContent).toBe('3')

    document.body.innerHTML = null
  })
})