// dom node identified attribute name
export const DATA_ID: string = 'data-kgid'

// vdom node reserved properties
export const RESERVED_PROPS: { [prop: string]: boolean } = { key: true, ref: true }

// default event listeners
const eventHandlers: string[] = Object.keys(window || {}).filter(key => /^on/.test(key))

export const SUPPORTED_LISTENERS: { [listener: string]: boolean } = {}
eventHandlers.forEach((listener: string) => SUPPORTED_LISTENERS[listener] = true)
