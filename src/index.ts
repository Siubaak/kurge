import render from './renderer/index'
import createElement from './vdom/create'

import useState from './hooks/state'
import useContext from './hooks/context'

import onBeforeMount from './hooks/effects/before-mount'
import onMounted from './hooks/effects/mounted'
import onBeforeUpdate from './hooks/effects/before-update'
import onUpdated from './hooks/effects/updated'
import onBeforeUnMount from './hooks/effects/before-unmount'
import onUnMounted from './hooks/effects/unmounted'

const Kurge = {
  render,
  createElement,

  useState,
  useContext,

  onBeforeMount,
  onMounted,
  onBeforeUpdate,
  onUpdated,
  onBeforeUnMount,
  onUnMounted
}

try {
  (window as any).Kurge = Kurge
} catch (err) {
  /* empty */
}

export default Kurge