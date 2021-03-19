import { dispatch, html, property } from "hybrids";
import styles from './node-base-puts.css'

function onclick(host, e, port) {
	dispatch(host, host.left ? 'connect-to' : 'connect-from', {
		detail: {id: host.id, port},
		bubbles: true,
		composed: true,
	})
}

const NodeBasePuts = {
	id: '',
	left: false,
	puts: property([]),
	render: ({puts, left}) => html`<div class="${{puts: true, left}}">
		${puts.map(({name, type, value, connected}, i) => html`
			<div data-name="${name}" title="${`${name}: ${JSON.stringify(value)}`}" class="${{
					put: true,
					type,
					connected: connected.length > 0,
				}}"
				onclick="${(host, e) => onclick(host, e, i)}"></div>
		`)}
	</div>`.style(styles),
}

export default NodeBasePuts