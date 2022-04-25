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
	connected: false,
	edge: getset({}),
	connectedType: ({connected, edge}) => connected && edge?.type,
	displayType: ({connectedType, types}) => connectedType || types?.[0] || 'any',
	// inputType: {get: (_, val) => val, set: (_, val) => val},
	input: false,
	disabled: false,
	classes: ({type, input, connected, disabled, displayType}) => {
		let classes = ['port', displayType]
		if(input) classes.push('input')
		if(connected) classes.push('connected')
		if(disabled) classes.push('disabled')
		return classes
	},
	render: ({classes, displayType}) => html`<div class="${classes}">
		<cam-icon>highlight_off</cam-icon>
	</div>`.css`
		div.port.${displayType} {
			background: var(--ndjinn-dt-${displayType}, #aaa);
		}
	`.style(styles)
})
