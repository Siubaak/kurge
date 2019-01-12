import observe from '../observer/index'
import Dependency from '../observer/dependeny'

export const context: { store: any } = { store: null }

export default function useContext(ctx: any) {
  if (Dependency.target) {
    throw new Error('please invoke useContext at top level outside all components')
  } else if (context.store) {
    console.warn('Only once can useContext be invoked')
  } else {
    context.store = observe(ctx)
  }
}