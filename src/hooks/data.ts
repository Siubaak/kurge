import observe from '../observer/index'

export default function useData(data: any) {
  console.log(this)
  return observe(data)
}