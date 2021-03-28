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
	id: 0,
	type: '',
	types: ({type}) => type.split(','),
	input: false,
	connected: false,
	edges: property([]),
	classes: ({input, connected, types}) => {
		let classes = ['port', ...types]
		if(input) classes.push('input')
		if(connected) classes.push('connected')
		return classes
	},
	render: ({classes}) => html`<div
		class="${classes}">
		<cam-icon>highlight_off</cam-icon>
	</div>`.style(styles)
}

export default NodePort