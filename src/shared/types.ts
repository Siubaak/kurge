// function component type
export interface Component {
  (props: any): Elem
  shouldUpdate?: (prevProps: Props, nextProps: Props) => boolean
}

// effect type
export type Effect = () => void | (() => void)

// instance type
export interface Instance {
  id: string
  index: number
  node: Text | HTMLElement

  readonly key: string
  
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

// reconciler update
export interface Update {
  id: string
  priority: number
  current: { instance: Instance, element: Elem }[]
}

// resquestIdleCallback callback argument
export interface IdleDeadline {
  timeRemaining: () => number
}

// resquestIdleCallback callback
export type IdleCallback = (deadline: IdleDeadline) => void