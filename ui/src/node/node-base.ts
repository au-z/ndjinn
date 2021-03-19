import {html, render, parent, Hybrids, RenderFunction, dispatch} from 'hybrids'
import {Node} from '@ndjinn/core'
import {Draggable} from '@auzmartist/cam-el'
import NodeBasePuts from './node-base-puts'
import styles from './node-base.css'
import NodeEditor from '../node-editor'

export interface NodeTemplate {
	name: string,
	fields: any[],
	// TODO remove <any>
	render: RenderFunction<any>,
}

export interface NodeElement extends HTMLElement {
	id: string,
	name: string,
	inputs: any[],
	outputs: any[],
	fields: any[],
	draggableStart: (host, e) => void,
	draggableEnd: (host, e) => void,
	draggableDrag: (host, e) => void,
}

export function Node<T extends NodeTemplate>(node: Node, template: T): Hybrids<NodeElement> {
	function renderNode<E extends NodeElement>(
		fn: RenderFunction<E>,
		options?: {shadowRoot?: boolean | object}
	) {
		return render<E>((host) => html`
			<div class="node"
				onmousedown="${host.draggableStart}"
				ontouchstart="${host.draggableStart}"
				onmousemove="${host.draggableDrag}"
				ontouchmove="${host.draggableDrag}"
				onmouseup="${host.draggableEnd}"
				ontouchend="${host.draggableEnd}">
				<div class="header">
					<label>${host.name}</label>
				</div>
				<div class="inputs">
					<node-base-puts left id="${host.id}"
						puts="${host.inputs.filter((i) => i.mode !== 'SOURCE')}"
					></node-base-puts>
				</div>
				<div class="outputs">
					<node-base-puts id="${host.id}"
						puts="${host.outputs}"
					></node-base-puts>
				</div>
				<div class="content">
					${fn(host)}
				</div>
			</div>
		`.define({NodeBasePuts}).style(styles), options)
	}

	const nodeComputed = (fn: (node: Node) => any) => ({
		get: () => fn(node),
		connect: (host, key, invalidate) => node.subscribe(() => invalidate()),
	})

	const mapFields = (node: Node) => {
		return template.fields.map((f) => {
			const input = f.name ? node.inputs.find((i) => i.name === f.name) : node.inputs[f.id]
			if(!input) throw new Error(`Cannot query input`);

			// TODO pass through form fields
			(input as any).mode = f.mode || 'SOURCE'
			if(input.connected.length > 0) f.mode = 'OPAQUE'

			return {...input}
		})
	}

	return {
		...template,
		id: node.id,
		parent: parent(NodeEditor),
		inputs: nodeComputed((node) => [...node.inputs]),
		outputs: nodeComputed((node) => [...node.outputs]),
		fields: nodeComputed(mapFields),
		run: () => node.run,
		set: () => node.set,
		connect: (host) => (output, id, input) => dispatch(host, 'connect', {detail: {
			from: [node.id, output],
			to: [id, input],
		}, bubbles: true}),
		...Draggable(),

		render: renderNode(template.render),
		// handle connect and disconnect lifecycle methods
		target: {
			get: (host) => host.render(),
			connect: (host) => {
				return () => dispatch(host, 'deleted', {detail: {node}, bubbles: true})
			},
			observe: (host, target) => {
				if(!target) return
				host.setAttribute('id', node.id)
				dispatch(host, 'created', {detail: {node}, bubbles: true})
			},
		},
	}
}



