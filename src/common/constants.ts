// dom node identified attribute name
export const DATA_ID: string = 'data-kgid'

// key for getting origin target of proxy
export const PROXY_TARGET: string = Math.random().toString(36).substring(2)

// vdom node reserved properties
export const RESERVED_PROPS: { [prop: string]: boolean } = { key: true, ref: true }

export const CUT_ON_REGEX: RegExp = /^on/
const eventHandlers: string[] = Object.keys(window || {}).filter(key => CUT_ON_REGEX.test(key))

// default events
export const SUPPORTED_EVENTS: string[] = eventHandlers.map(key => key.replace(CUT_ON_REGEX, ''))

// default event listeners
export const SUPPORTED_LISTENERS: { [listener: string]: boolean } = {}
eventHandlers.forEach((listener: string) => SUPPORTED_LISTENERS[listener] = true)
