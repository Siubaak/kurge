import React, { useState } from '../../..'
import useI18N from '../hooks/i18n'
import './todo-list.less'

let uid = 0

export default function TodoList() {
  const I18N = useI18N()
  const state = useState({
    input: '',
    todos: []
  })
  function handleAdd() {
    if (state.input !== '' && state.todos.length < 6) {
      state.todos.push({ key: uid++, item: state.input })
      state.input = ''
    }
  }
  return (
    <div className="todo-list">
      <p className="desc">{I18N[11]}</p>
      <div className="input-box">
        <input className="input" onInput={e => state.input = e.target.value} value={state.input}></input>
        <button className="add" onClick={handleAdd}>{I18N[12]}</button>
      </div>
      <ul className="list">
        {
          state.todos.length
          ? state.todos.map((todo, index) => 
            <li className="item" key={todo.key}>
              {todo.item}
              <button className="del" onClick={() => state.todos.splice(index, 1)}>{I18N[13]}</button>
            </li>
          )
          : <li className="item">{I18N[14]}</li>
        }
      </ul>
    </div>
  )
}
