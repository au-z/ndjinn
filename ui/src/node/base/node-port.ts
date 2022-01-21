import { html, Hybrids, property } from "hybrids";
import styles from './node-port.css'

export interface NodePort extends HTMLElement {
	type: string,
	input: boolean,
	connected: boolean,
	edges: any[],
	[key: string]: any,
}

const NodePort: Hybrids<NodePort> = {
	tag: 'node-port',
	id: 0,
	type: '',
	types: ({type}) => type.split(','),
	input: false,
	connected: false,
	disabled: false,
	inputType: {get: (_, val) => val, set: (_, val) => val},
	edges: property([]),
	classes: ({type, input, connected, disabled, edges, types}) => {
		let classes = ['port', ...types]
		if(input) classes.push('input')
		if(connected) classes.push('connected')
		if(connected && edges[0]?.type) classes.push(edges[0].type)
		if(disabled) classes.push('disabled')
		return classes
	},
	render: ({classes}) => html`<div class="${classes}">
		<cam-icon>highlight_off</cam-icon>
	</div>`.style(styles)
}

export default NodePort