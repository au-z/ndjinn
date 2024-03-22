import { define, dispatch, html, parent } from 'hybrids'
import * as CamEl from '@auzmartist/cam-el'
import NdjinnUI from './ui/index.js'
import Nodes from './node/index.js'

import Mousetrap from 'mousetrap'

let components = {
  ...CamEl,
  ...NdjinnUI,
  ...Nodes,
}

// Candidate cam-el
define<any>({
  tag: 'cam-hotkey-toggle',
  keys: 'x',
  escape: false,
  on: false,
  parent: parent((hy) => hy.hasOwnProperty('tagName')),
  value: {
    get: (host, val = host.on) => val,
    set: (host, val) => val,
    connect: (host, key) => {
      Mousetrap(host.parent).bind(host.keys, (e) => {
        dispatch(host, 'change', { detail: !host[key], bubbles: true })
        host[key] = !host[key]
      })
      host.escape &&
        Mousetrap(host.parent).bind('esc', (e) => {
          host[key] = false
          dispatch(host, 'close', { detail: host[key], bubbles: true })
        })
    },
  },
  render: ({ value }) => html`<div tabindex="0">
    ${value ? html`<slot name="on"></slot>` : html`<slot name="off"></slot>`}
  </div>`,
})
