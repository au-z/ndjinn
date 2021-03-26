import { dispatch, html, property } from "hybrids";
import NodePort from './node-port'
import styles from './node-ports.css'

function onclick(host, e, port) {
	dispatch(host, host.left ? 'connect-to' : 'connect-from', {
		detail: {id: host.id, port},
		bubbles: true,
		composed: true,
	})
}

const NodePorts = {
	id: '',
	left: false,
	ports: property([]),
	render: ({ports, left}) => html`<div class="${{ports: true, left}}">
		${ports.map(({name, type, value, connected}, i) => html`
		<node-port title="${`${name}: ${JSON.stringify(value)}`}"
			id="${i}"
			input="${left}"
			type="${type}"
			connected="${connected.length > 0}"
			edges="${[...connected]}"
			onclick="${(host, e) => onclick(host, e, i)}"></node-port>
		`)}
	</div>`.define({NodePort}).style(styles),
}

export default NodePorts