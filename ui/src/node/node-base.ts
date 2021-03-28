import {html, render, parent, Hybrids, RenderFunction, dispatch} from 'hybrids'
import {Node, create} from '@ndjinn/core'
import {Draggable} from '@auzmartist/cam-el'
import NodePorts from './node-ports'
import styles from './node-base.css'
import NodeEditor, {NodeEditor as INodeEditor} from '../node-editor'

export interface NodeTemplate {
	name: string,
	in: any[],
	out: any[],
	fields: any[],
	render: RenderFunction<any>,
}

export interface NodeElement extends HTMLElement {
	id: string,
	parent: INodeEditor,
	name: string,
	inputs: any[],
	outputs: any[],
	fields: any[],
	selected: boolean,
	incoming: any[],
	outgoing: any[],
	set: (args: any[] | object) => void,
	run: () => void,
	select: (host, e) => void,
	draggableStart: (host, e) => void,
	draggableEnd: (host, e) => void,
	draggableDrag: (host, e) => void,
}

export function NodeUI<T extends NodeTemplate>(invoker: (...args: any[]) => any[], defaults: any[], template: T): Hybrids<NodeElement> {
	const nodeComputed = (fn: (node: Node) => any) => ({
		get: ({node}) => fn(node),
		connect: (host, key, invalidate) => {
			host.node?.subscribe(() => invalidate())
		},
	})

	const mapFields = (node: Node) => {
		return template.fields.map((f) => {
			const input = f.name ? node.inputs.find((i) => i.name === f.name) : node.inputs[f.id]
			if(!input) throw new Error(`Cannot query input`);
	
			if(input.connected.length > 0) f.mode = 'OPAQUE'
	
			return {
				...input,
				mode: f.mode || 'SOURCE',
			}
		})
	}

	function connectNode(host, node: Node, invalidate) {
		host.setAttribute('id', node.id)
		host.id = node.id
		host.run = node.run
		host.set = (...args) => {
			node.set(...args)
			dispatch(host, 'save', {detail: null, bubbles: true})
		}

		node.subscribe(() => invalidate())
		dispatch(host, 'created', {detail: {node}, bubbles: true})
	}

	function connectDraggable(host) {
		const io = Draggable({absolutePositioning: true})
		io.draggableInit(host)
		host.draggableStart = io.draggableStart
		host.draggableDrag = io.draggableDrag
		host.draggableEnd = io.draggableEnd
	}

	function onclick(host, e) {
		dispatch(host, 'select', {detail: {id: host.id, add: e.shiftKey}, bubbles: true})
	}

	return {
		// Parent
		parent: parent(NodeEditor),
		selected: ({id, parent}) => parent.selected.includes(id),
		// Custom Properties
		...template,

		// state restoration
		incoming: [],
		outgoing: [],

		node: {
			connect: (host, key, invalidate) => {
				let node = create(invoker, defaults, {in: template.in, out: template.out})
				const persistedId = host.getAttribute('id')
				if(persistedId) node.id = persistedId

				connectNode(host, node, invalidate)
				connectDraggable(host)
				host[key] = node
			},
		},

		inputs: <any>nodeComputed((node) => [...node.inputs]),
		outputs: <any>nodeComputed((node) => [...node.outputs]),
		fields: nodeComputed(mapFields),

		render: renderNode(template.render),
	}

	function renderNode<E extends NodeElement>(fn: RenderFunction<E>, options?: {shadowRoot?: boolean | object}) {
		return render<E>((host) => html`
			<div class="${{node: true, selected: host.selected}}"
				onclick="${onclick}"
				onmousedown="${host.draggableStart}"
				ontouchstart="${host.draggableStart}"
				onmousemove="${host.draggableDrag}"
				ontouchmove="${host.draggableDrag}"
				onmouseup="${host.draggableEnd}"
				ontouchend="${host.draggableEnd}">
				<div class="header">
					<label title="${host.id}">${host.name}</label>
				</div>
				<div class="inputs">
					<node-ports inputs id="${host.id}"
						edges="${host.incoming}"
						ports="${host.inputs.filter((i) => i.mode !== 'SOURCE')}"></node-ports>
				</div>
				<div class="outputs">
					<node-ports id="${host.id}"
						edges="${host.outgoing}"
						ports="${host.outputs}"></node-ports>
				</div>
				<div class="content">
					${fn(host)}
				</div>
			</div>
		`.define({NodePorts}).style(styles), options)
	}
}
