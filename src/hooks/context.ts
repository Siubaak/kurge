import observe from '../observer/index'
import Dependency from '../observer/dependeny'
import { PROXY_TARGET } from '../common/constants'
import { assign } from '../utils/index'

export const context: { store: any } = { store: null }

export default function useContext(ctx: any) {
  if (Dependency.target) {
    throw new Error('please invoke useContext at top level outside all components')
  } else if (context.store) {
    // merge duplicate contexts when invoke useContext multiple times
    assign(context.store[PROXY_TARGET], ctx)
  } else {
    context.store = observe(ctx)
  }
}