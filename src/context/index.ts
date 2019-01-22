import observe from '../observer'
import Dependency from '../observer/dependeny'

export default function createContext(ctx: any) {
  if (Dependency.target) {
    throw new Error('please call createContext outside all components')
  } else {
    return observe(ctx)
  }
}