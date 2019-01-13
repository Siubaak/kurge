import render from './renderer/index'
import createElement from './vdom/create'

import useState from './hooks/state'
import useContext from './hooks/context'
import useRefs from './hooks/refs'

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
  useRefs,

  onBeforeMount,
  onMounted,
  onBeforeUpdate,
  onUpdated,
  onBeforeUnMount,
  onUnMounted
}

export default Kurge