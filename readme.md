# Kurge &middot; [![npm version](https://img.shields.io/npm/v/kurge.svg?style=flat)](https://www.npmjs.com/package/kurge) [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/Siubaak/kurge/blob/master/LICENSE)

Kurge is a reactive function component based JavaScript UI binding library.

* **Hook-Dominated:** All kinds of powerful hooks are available, to keep your state free of components, views and any other stuffs, making it easier to seperate state and view.
* **Function-Based:** No class components, no object components, and all components are organized by function. Build encapsulated function components to compose your view making UIs.

## Installation

You can use Kurge as a package installed on [npm](https://www.npmjs.com/package/kurge).

```bash
npm i -S kurge
```

Or, download the [minimized version](https://github.com/Siubaak/kurge/blob/master/dist/kurge.min.js), and link in a `<script>` tag.

## Documentation

You can find getting started and documentation on the [website](https://siubaak.github.io/kurge) or the [wiki](https://github.com/Siubaak/kurge/wiki).  

## Example

Several [examples here](https://github.com/Siubaak/kurge/tree/master/docs/examples). You can get started with this first simple one, and it will render a `<p>` tag with text "Hello World!" into a "#app" root container:

```jsx
function Hello() {
  const state = useState({ message: 'World' })
  return <p>Hello {state.message}!</p> 
}

Kurge.render(<Hello/>, document.getElementById('app'))
```

Kurge are compatible with [JSX](https://reactjs.org/docs/introducing-jsx.html). Grateful for [React](https://reactjs.org) making such wonderful HTML-like syntax.

## Note

Kurge depends [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) and [Reflect](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Reflect) of ES6 to observe the state and context. So you need polyfills to run Kurge in those unsupported browsers.

## License

Kurge is [MIT licensed](https://github.com/Siubaak/kurge/blob/master/LICENSE).