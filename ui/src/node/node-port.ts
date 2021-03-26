import { html, Hybrids, property } from "hybrids";

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
	}}"></div>
	<style>
		.port {
			width: 8px;
			height: 8px;
			border-radius: 8px;
			background: white;
			border: 4px solid var(--node-editor-bg, black);
		}
		.port.connected {
			background: orange;
		}
	</style>`
}

export default NodePort