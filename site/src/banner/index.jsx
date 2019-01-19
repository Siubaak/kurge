import React from '../../..'
import useI18N from '../hooks/i18n'
import context from '../hooks/context'
import './banner.less'

export default function Banner() {
  const I18N = useI18N()
  function changeLang() {
    context.lang = context.lang === 'CN' ? 'EN' : 'CN'
  }
  return (
    <header className="banner">
      <h1 className="title">Kurge</h1>
      <p className="desc">{I18N[0]}</p>
      <div className="opr">
        <a href="https://github.com/Siubaak/kurge/wiki/Get-Started">{I18N[1]}</a>
        <a href="https://github.com/Siubaak/kurge/wiki/Documentation">{I18N[2]}</a>
      </div>
      <div className="link">
        <a onClick={changeLang}>{context.lang === 'CN' ? 'EN' : 'CN'}</a>
        <a href="https://github.com/Siubaak/kurge">GITHUB</a>
        <a href="https://www.npmjs.com/package/kurge">NPM</a>
      </div>
    </header>
  )
}