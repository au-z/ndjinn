import { html, Hybrids, property } from "hybrids";
import styles from './node-port.css'

export interface NodePort extends HTMLElement {
	type: string,
	input: boolean,
	connected: boolean,
	edges: any[],
}

const NodePort: Hybrids<NodePort> = {
	id: 0,
	type: '',
	input: false,
	connected: false,
	edges: property([]),
	render: ({type, input, connected}) => html`<div class="${{
		port: true,
		input,
		type,
		connected,
	}}">
		<cam-icon>highlight_off</cam-icon>
	</div>`.style(styles)
}

export default NodePort