import { NodeEdge } from '@ndjinn/core';
import { define, html } from 'hybrids';
import { getset } from "../../utils/hybrids";
import styles from './node-port.css';

export interface NodePort extends HTMLElement {
	type: string,
	input: boolean,
	connected: boolean,
	edge: NodeEdge, // only the incoming edge
	[key: string]: any,
}

export const NodePort = define<NodePort>({
	tag: 'node-port',
	type: '',
	types: ({type}) => type.split(','),
	input: false,
	connected: false,
	disabled: false,
	inputType: {get: (_, val) => val, set: (_, val) => val},
	edge: getset({}),
	classes: ({type, input, connected, disabled, edge, types}) => {
		let classes = ['port', ...types]
		if(input) classes.push('input')
		if(connected) classes.push('connected')
		if(connected && edge?.type) classes.push(edge.type)
		if(disabled) classes.push('disabled')
		return classes
	},
	render: ({classes}) => html`<div class="${classes}">
		<cam-icon>highlight_off</cam-icon>
	</div>`.style(styles)
})
