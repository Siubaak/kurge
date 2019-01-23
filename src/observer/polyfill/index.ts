export function set(object: any, key: string | number | symbol, value: any) {
  if ((window as any).Proxy) {
    console.warn('Proxy is natively supported, and you may not need to call set')
    object[key] = value
  } else {

  }
}

export function del(object: any, key: string | number | symbol) {
  if ((window as any).Proxy) {
    console.warn('Proxy is natively supported, and you may not need to call del')
    delete object[key]
  } else {
    
  }
}