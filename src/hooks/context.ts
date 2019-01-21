import observe from '../observer'
import Dependency from '../observer/dependeny'

export default function useContext(ctx: any) {
  if (Dependency.target) {
    throw new Error('please call useContext at top level outside all components')
  } else {
    return observe(ctx)
  }
}