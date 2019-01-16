import Dependency from '../observer/dependeny'

export default function useRefs() {
  if (!Dependency.target) {
    throw new Error('please call useRefs at top level in a component')
  } else {
    return Dependency.target.instance.refs
  }
}