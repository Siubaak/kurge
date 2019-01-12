import observe from '../observer/index'

export default function useData(data: any) {
  return observe(data)
}