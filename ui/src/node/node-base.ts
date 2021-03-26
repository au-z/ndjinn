import {html, render, parent, Hybrids, RenderFunction, dispatch, Property} from 'hybrids'
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
	// TODO remove <any>
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
	select: (host, e) => void,
	draggableStart: (host, e) => void,
	draggableEnd: (host, e) => void,
	draggableDrag: (host, e) => void,
}

export function NodeUI<T extends NodeTemplate>(invoker: (...args: any[]) => any[], defaults: any[], template: T): Hybrids<NodeElement> {
	let node: Node

	function renderNode<E extends NodeElement>(fn: RenderFunction<E>, options?: {shadowRoot?: boolean | object}) {
		return render<E>((host) => html`
			<div class="${{
					node: true,
					selected: host.selected,
				}}"
				onclick="${host.select}"
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
					<node-ports left id="${host.id}" ports="${host.inputs.filter((i) => i.mode !== 'SOURCE')}"></node-ports>
				</div>
				<div class="outputs">
					<node-ports id="${host.id}" ports="${host.outputs}"></node-ports>
				</div>
				<div class="content">
					${fn(host)}
				</div>
			</div>
		`.define({NodePorts}).style(styles), options)
	}

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
	
			// TODO pass through form fields
			(input as any).mode = f.mode || 'SOURCE'
			if(input.connected.length > 0) f.mode = 'OPAQUE'
	
			return {...input}
		})
	}

	function connectNode(host, node: Node, invalidate) {
		host.setAttribute('id', node.id)
		host.id = node.id
		host.run = node.run
		host.set = node.set

		node.subscribe(() => invalidate())
		dispatch(host, 'created', {detail: {node}, bubbles: true})
	}

	function connectDraggable(host) {
		const io = Draggable({absolutePositioning: true})
		host.draggableStart = io.draggableStart
		host.draggableDrag = io.draggableDrag
		host.draggableEnd = io.draggableEnd
	}

	return {
		// Parent
		parent: parent(NodeEditor),
		selected: ({id, parent}) => parent.selected.includes(id),
		// Custom Properties
		...template,

		node: {
			connect: (host, key, invalidate) => {
				node = create(invoker, defaults, {in: template.in, out: template.out})
				connectNode(host, node, invalidate)
				connectDraggable(host)
				host[key] = node
			},
		},
		inputs: <any>nodeComputed((node) => [...node.inputs]),
		outputs: <any>nodeComputed((node) => [...node.outputs]),
		fields: nodeComputed(mapFields),

		render: renderNode(template.render),
		select: () => (host, e: MouseEvent) => {
			dispatch(host, 'select', {detail: {id: host.id, add: e.shiftKey}, bubbles: true})
		},
	}
}

// export function Node<T extends NodeTemplate>(node: Node, template: T): Hybrids<NodeElement> {
// 	function renderNode<E extends NodeElement>(
// 		fn: RenderFunction<E>,
// 		options?: {shadowRoot?: boolean | object}
// 	) {
// 		return render<E>((host) => html`
// 			<div class="${{
// 					node: true,
// 					selected: host.selected,
// 				}}"
// 				onclick="${host.select}"
// 				onmousedown="${host.draggableStart}"
// 				ontouchstart="${host.draggableStart}"
// 				onmousemove="${host.draggableDrag}"
// 				ontouchmove="${host.draggableDrag}"
// 				onmouseup="${host.draggableEnd}"
// 				ontouchend="${host.draggableEnd}">
// 				<div class="header">
// 					<label>${host.name}</label>
// 				</div>
// 				<div class="inputs">
// 					<node-ports left id="${host.id}" ports="${host.inputs.filter((i) => i.mode !== 'SOURCE')}"></node-ports>
// 				</div>
// 				<div class="outputs">
// 					<node-ports id="${host.id}" ports="${host.outputs}"></node-ports>
// 				</div>
// 				<div class="content">
// 					${fn(host)}
// 				</div>
// 			</div>
// 		`.define({NodePorts}).style(styles), options)
// 	}

// 	const mapFields = (node: Node) => {
// 		return template.fields.map((f) => {
// 			const input = f.name ? node.inputs.find((i) => i.name === f.name) : node.inputs[f.id]
// 			if(!input) throw new Error(`Cannot query input`);

// 			// TODO pass through form fields
// 			(input as any).mode = f.mode || 'SOURCE'
// 			if(input.connected.length > 0) f.mode = 'OPAQUE'

// 			return {...input}
// 		})
// 	}

// 	return {
// 		...template,
// 		id: node.id,
// 		parent: parent(NodeEditor),
// 		inputs: nodeComputed((node) => [...node.inputs]),
// 		outputs: nodeComputed((node) => [...node.outputs]),
// 		fields: nodeComputed(mapFields),
// 		selected: ({id, parent}) => parent.selected.includes(id),
// 		run: () => node.run,
// 		set: () => node.set,
// 		connect: (host) => (output, id, input) => dispatch(host, 'connect', {detail: {
// 			from: [node.id, output],
// 			to: [id, input],
// 		}, bubbles: true}),
// 		select: () => (host, e: MouseEvent) => {
// 			e.preventDefault()
// 			dispatch(host, 'select', {detail: {id: host.id, add: e.shiftKey}, bubbles: true})
// 		},
// 		...Draggable({absolutePositioning: true}),
// 		render: renderNode(template.render),
// 		// handle connect and disconnect lifecycle methods
// 		target: {
// 			get: (host) => host.render(),
// 			observe: (host, target) => {
// 				if(!target) return
// 				host.setAttribute('id', node.id)
// 				dispatch(host, 'created', {detail: {node}, bubbles: true})
// 			},
// 		},
// 	}
// }



