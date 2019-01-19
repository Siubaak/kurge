import Kurge from '../../src'
import { VDomNode, Elem } from '../../src/shared/types'

describe('test/element.test.js', () => {
  const h = Kurge.createElement
  const style = { height: '100px' }

  it('should create a native kurge element', () => {
    const element: VDomNode = h('div', { className: 'test', style })

    expect(element.type).toBe('div')
    expect(element.props.className).toBe('test')
    expect(element.props.style).toBe(style)
    expect(Array.isArray(element.props.children)).toBeTruthy()
    expect(element.props.children.length).toBe(0)
  })

  it('should create a component kurge element', () => {
    function Comp() { return '' }
    const element: VDomNode = h(Comp, { className: 'test', style })

    expect(element.type).toBe(Comp)
    expect(element.props.className).toBe('test')
    expect(element.props.style).toBe(style)
    expect(Array.isArray(element.props.children)).toBeTruthy()
    expect(element.props.children.length).toBe(0)
  })

  it('should create a kurge element with children', () => {
    function Comp() { return '' }
    const element: VDomNode = (
      h('div', { className: 'test', style },
        'test',
        h('a', { key: 1, style }),
        h(Comp, { key: 2, style })
      )
    )

    expect(element.type).toBe('div')
    expect(element.props.className).toBe('test')
    expect(element.props.style).toBe(style)
    expect(Array.isArray(element.props.children)).toBeTruthy()
    expect(element.props.children.length).toBe(3)
  
    const children: Elem[] = element.props.children

    expect(children[0]).toBe('test')
    expect((children[1] as VDomNode).type).toBe('a')
    expect((children[1] as VDomNode).key).toBe('1')
    expect((children[1] as VDomNode).props.style).toBe(style)
    expect((children[2] as VDomNode).type).toBe(Comp)
    expect((children[2] as VDomNode).key).toBe('2')
    expect((children[2] as VDomNode).props.style).toBe(style)
  })
})