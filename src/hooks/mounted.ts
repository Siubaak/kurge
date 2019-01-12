import bus from '../utils/bus'

export default function useMounted(callback: () => void) {
  bus.on('mounted', callback)
}