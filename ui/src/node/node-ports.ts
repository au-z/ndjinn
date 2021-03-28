import { dispatch, html, property } from "hybrids";
import NodePort from './node-port'

import styles from './node-ports.css'

function onclick(host, e, port, isInput, edges) {
	if(edges.length > 0 && isInput) {
		edges.forEach((from) => {
			dispatch(host, 'disconnect', {
				detail: {from, to: {id: host.id, port}},
				bubbles: true,
				composed: true,
			})
		})
	} else {
		dispatch(host, host.inputs ? 'connect-to' : 'connect-from', {
			detail: {id: host.id, port},
			bubbles: true,
			composed: true,
		})
	}
}

const NodePorts = {
	id: '',
	inputs: false,
	ports: property([]),
	edges: {
		...property([]),
		observe: (host, edges, last) => {
			if(last || edges.length < 1) return
			edges.forEach((e, i) => e.forEach((c) => {
				const port = {id: host.id, port: i}
				dispatch(host, 'connect', {detail: {
					from: host.inputs ? c : port,
					to: host.inputs ? port : c,
				}, bubbles: true, composed: true})
			}))
		},
	},
	render: ({ports, inputs}) => html`<div class="${{ports: true, inputs}}">
		${ports.map(({name, type, value, connected}, i) => html`
		<node-port title="${`${name}: ${JSON.stringify(value)}`}"
			id="${i}"
			input="${inputs}"
			type="${type}"
			connected="${connected.length > 0}"
			edges="${[...connected]}"
			onclick="${(host, e) => onclick(host, e, i, inputs, connected)}"></node-port>
		`)}
	</div>`.define({NodePort}).style(styles),
}

export default NodePorts