import { DATA_ID } from '../common/constants'

// get mounted dom node by id
export function getNode(id: string): HTMLElement {
  return document.querySelector(`[${DATA_ID}="${id}"]`)
}

// create dom by html markup
export function createNode(markup: string): Text | HTMLElement {
  if (markup === '') {
    return document.createTextNode('')
  } else {
    const node: HTMLElement = document.createElement('div')
    node.innerHTML = markup
    return node.firstChild as HTMLElement
  }
}

// transform className object to class string
export function getClassString(className: any): string {
  let markup: string = ''
  if (className == null) {
  } else if (typeof className === 'object') {
    markup += Object.keys(className).filter(cls => className[cls]).join(' ')
  } else if (Array.isArray(className)) {
    markup += className.join(' ')
  } else {
    markup += className.toString()
  }
  return markup.trim()
}

// transform style object to style string
export function getStyleString(style: any): string {
  let markup: string = ''
  if (style == null) {
  } else if (typeof style === 'object') {
    for (const key in style) {
      if (Object.hasOwnProperty.call(style, key)) {
        // transform camel case to kebab case, and both of them are supported
        markup += key.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`) + `: ${style[key]}; `
      }
    }
  } else {
    markup += style.toString()
  }
  return markup.trim()
}
