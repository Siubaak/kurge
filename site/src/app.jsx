import React from '../../dist'
import Banner from './banner'
import Content from './content'
import Footer from './footer'
import './app.less'

export default function App() {
  return (
    <div id="app">
      <Banner/>
      <Content/>
      <Footer/>
    </div>
  )
}