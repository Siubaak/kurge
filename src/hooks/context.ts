import observe from '../observer/index'
import Dependency from '../observer/dependeny'
import { is } from '../utils'

export default function useContext(ctx: any) {
  if (!is.object(ctx) && !is.array(ctx)) {
    throw new Error('useContext only accepts object or array')
  } else if (Dependency.target) {
    throw new Error('please call useContext at top level outside all components')
  } else {
    return observe(ctx)
  }
}