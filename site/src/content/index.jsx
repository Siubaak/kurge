import React, { useRefs, useEffect } from '../../../dist'
import useI18N from '../hooks/i18n'
import TodoList from '../todo-list'
import hljs from 'highlightjs'
import './content.less'
import 'highlightjs/styles/vs2015.css'

function getCode(I18N) {
  return `let uid = 0
function TodoList() {
  const state = useState({ input: '', todos: [] })
  function handleAdd(e) {
    if (state.input !== '' && state.todos.length < 6) {
      state.todos.push({ key: uid++, item: state.input })
      state.input = ''
    }
  }
  return (
    <div className="demo">
      <p className="desc">${I18N[11]}</p>
      <div className="input-box">
        <input className="input"
          onInput={e => state.input = e.target.value}
          value={state.input}></input>
        <button className="add"
          onClick={handleAdd}>${I18N[12]}</button>
      </div>
      <ul className="list">
        {state.todos.length ? state.todos.map((todo, index) => 
          <li className="item" key={todo.key}>
            {todo.item}
            <button className="del"
              onClick={() => state.todos.splice(index, 1)}>
              ${I18N[13]}
            </button>
          </li>) : <li className="item">${I18N[14]}</li>}
      </ul>
    </div>
  )
}`
}

export default function Content() {
  const I18N = useI18N()
  const refs = useRefs()
  
  useEffect(() => {
    refs.code.innerHTML = hljs.highlightAuto(getCode(I18N), ['javascript']).value
  })

  return (
    <div className="container">
      <section className="intro">
        <div className="card">
          <h2 className="title">{I18N[3]}</h2>
          <p className="desc">{I18N[4]}</p>
        </div>
        <div className="card">
          <h2 className="title">{I18N[5]}</h2>
          <p className="desc">{I18N[6]}</p>
        </div>
      </section>
      <hr className="seperate"/>
      <section className="card">
        <h2 className="title">{I18N[7]}</h2>
        <p className="desc">{I18N[8]}</p>
      </section>
      <section className="demo">
        <div className="code">
          <pre><code class="hljs todo-list-code" ref="code"></code></pre>
        </div>
        <div className="example">
          <TodoList></TodoList>
        </div>
      </section>
      <hr className="seperate"/>
      <section className="card">
        <h2 className="title">{I18N[9]}</h2>
        <p className="desc">{I18N[10]}</p>
      </section>
    </div>
  )
}