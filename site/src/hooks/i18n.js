import context from './context'

const I18N = {
  CN: [
    '基于函数式组件的响应式视图绑定库',
    '开始',
    '文档',
    'Hook优先',
    '内置了多种灵活可用的hook，使你的状态和副作用独立于任何东西。让状态与视图分离，让逻辑与组件分离。',
    '函数组件',
    '没有类组件，没有对象组件，所有组件都是函数。封装函数组件来组织你的视图、搭建你的页面。',
    '示例',
    '使用函数来构建一个待办事项组件，并且调用useState hook来保存状态，然后返回一个JSX来描述组件的视图。',
    '注意',
    'Kurge依赖ES6的Proxy和Refect来实现响应式监测state和context的变化。如果在不支持该特性的浏览器使用Kurge，需要相应的polyfill。',
    '待办事项',
    '添加',
    '完成',
    '无',
    '开始',
    '文档',
  ],
  EN: [
    'A reactive function component based JavaScript UI binding library',
    'Get Started',
    'Documentation',
    'Hook Dominated',
    'All kinds of powerful hooks are available, to keep your states and effects free of all stuffs, making it possible to seperate state with view and logic with component.',
    'Function Based',
    'No class components, no object components, and all components are organized by function. Build encapsulated function components to compose your view making UIs.',
    'Example',
    'Use a function to build a Todo-List component, and call the useState hook to save state, then return a JSX to describe the component view.',
    'Note',
    'Kurge depends Proxy and Reflect of ES6 to observe the change of states and contexts. So you need polyfills to run Kurge in those unsupported browsers.',
    'Todo-List',
    'Add',
    'Done',
    'None',
    'Start',
    'Docs',
  ]
}

export default function useI18N() {
  return I18N[context.lang]
}
