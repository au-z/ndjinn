import { DT, Port } from "@ndjinn/core";
import { dispatch, html, property } from "hybrids";
import NodePort from './node-port'

import styles from './node-ports.css'

function onclick(host, e, port, type, isInput, edges) {
	if(edges.length > 0 && isInput) {
		edges.forEach((from) => {
			dispatch(host, 'disconnect', {
				detail: {from, to: {id: host.id, port, type}},
				bubbles: true,
				composed: true,
			})
		})
	} else {
		dispatch(host, host.inputs ? 'connect-to' : 'connect-from', {
			detail: {id: host.id, port, type},
			bubbles: true,
			composed: true,
		})
	}
}

const NodePorts = {
	tag: 'node-ports',
	id: '',
	inputs: false,
	ports: property([]),
	edges: {
		...property([]),
		observe: (host, edgesInAndOut, last) => {
			if(last || edgesInAndOut.length < 1) return
			edgesInAndOut?.forEach((edges, i) => edges.forEach((edge) => {
				const port = {id: host.id, port: i, type: host.ports[i].type};

				const detail = host.inputs ?
					({from: edge, to: port}) : ({from: port, to: edge})
				dispatch(host, 'connect', {detail, bubbles: true, composed: true})
			}))
		},
	},
	render: ({ports, inputs}) => html`<div class="${{ports: true, inputs}}">
		${ports.map(({name, type, value, connected, mode}, i) => html`
		<node-port title="${`${name}: ${JSON.stringify(value)}`}"
			id="${i}"
			input="${inputs}"
			type="${type}"
			connected="${connected.length > 0}"
			edges="${[...connected]}"
			onclick="${(host, e) => onclick(host, e, i, type, inputs, connected)}"></node-port>
		`)}
	</div>`.define(NodePort).style(styles),
}

export default NodePorts