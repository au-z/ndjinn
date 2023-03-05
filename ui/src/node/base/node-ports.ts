import { define, dispatch, html, parent } from 'hybrids'
import { getset } from '../../utils/hybrids'
import './node-port.js'

import { DT, NodeEdge, Port } from '@ndjinn/core'
import { NodeElement } from './node-base'
import styles from './node-ports.css?inline'

function onclick(host, e, port, type, isInput, connected) {
  if (connected && isInput) {
    dispatch(host, 'disconnect', {
      detail: { from: connected, to: { id: host.node.id, port, type } },
      bubbles: true,
      composed: true,
    })
  } else {
    dispatch(host, host.inputs ? 'connect-to' : 'connect-from', {
      detail: { id: host.node.id, port, type },
      bubbles: true,
      composed: true,
    })
  }
}

export interface NodePorts extends HTMLElement {
  id: string
  node: NodeElement
  inputs: boolean
  ports: Port[]
  edges: NodeEdge[]
}

export default define<NodePorts>({
  tag: 'node-ports',
  node: parent((el: any) => el.hasOwnProperty('node')),
  inputs: false,
  ports: getset([]),
  edges: {
    ...getset([]),
    observe: (host, subs, last) => {
      // if(!host.inputs && (last || subs.length < 1)) return
      // console.log('reconnect', host, subs)
      // subs?.forEach((edges, i) => edges.forEach((edge) => {
      // 	const port = {id: host.id, port: i, type: host.ports[i].type};
      // 	const detail = host.inputs ?
      // 		({from: edge, to: port}) : ({from: port, to: edge})
      // 	dispatch(host, 'connect', {detail, bubbles: true, composed: true})
      // }))
    },
  },
  render: ({ ports, inputs, edges }) =>
    html`<div class="${{ ports: true, inputs }}">
      ${ports.map(
        ({ name, type, value }, i) => html`
          <node-port
            title="${name ? `${name ?? i}: ${JSON.stringify(value)}` : JSON.stringify(value)}"
            data-id="${i}"
            input="${inputs}"
            type="${type ?? DT.any}"
            connected="${!!edges[i]}"
            edge="${edges[i]}"
            onclick="${(host, e) => onclick(host, e, i, type, inputs, edges[i])}"
          ></node-port>
        `
      )}
    </div>`.style(styles),
})

//		edges="${[...connected]}"
