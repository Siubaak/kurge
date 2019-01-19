import React from '../../..'
import useI18N from '../hooks/i18n'
import './footer.less'

export default function Footer() {
  const I18N = useI18N()
  return (
    <div className="footer">
      <a href="https://github.com/Siubaak/kurge/wiki/Get-Started">{I18N[15]}</a>
      &nbsp;&nbsp;-&nbsp;&nbsp;
      <a href="https://github.com/Siubaak/kurge/wiki/Documentation">{I18N[16]}</a>
      &nbsp;&nbsp;-&nbsp;&nbsp;
      <a href="https://github.com/Siubaak/kurge">Github</a>
      &nbsp;&nbsp;-&nbsp;&nbsp;
      <a href="https://www.npmjs.com/package/kurge">Npm</a>
    </div>
  )
}