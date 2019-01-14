// function component type
export type Component = (props: any) => VDomNode

// instance type
export interface Instance {
  id: string
  index: number

  readonly key: string
  readonly node: HTMLElement
  
  mount: (id: string) => string
  same: (nextElement: Elem) => boolean
  update: (nextElement: Elem) => void
  unmount: () => void
}

// vdom node child type
export type Elem = number | string | VDomNode

// vdom node props interface
export interface Props {
  children: Elem[]
  [prop: string]: any
}

// vdom type interface
export interface VDomNode {
  type: string | Component
  key: string
  ref: string
  props: Props
}

// patch list
export interface Patches {
  ops: PatchOp[],
  dir: 'forward' | 'backward'
}

// patch operation
export interface PatchOp {
  type: 'insert' | 'move' | 'remove'
  inst: Instance
  index?: number
}

// reconciler dirty instance set
export interface DirtyInstance {
  instance: Instance
  element: Elem
}