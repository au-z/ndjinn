import {html, render, Hybrids, RenderFunction, dispatch, UpdateFunctionWithMethods, define as defineHybrids} from 'hybrids'
import {Node, NodeOptions, create2, Op, PortOptions} from '@ndjinn/core'
import {Draggable} from '@auzmartist/cam-el'
import NodePorts from './node-ports'
import styles from './node-base.css'
import store, { redux } from '../../store/store'
import { Field, NodeElement, NodeTemplate } from './models'
import { TEMPLATE_BASIC_FIELDS } from './templates'

const nodeComputed = <T>(fn: (node: Node) => T) => ({
	get: ({node}) => fn(node),
	connect: (host, key, invalidate) => {
		host.node?.subscribe((n) => invalidate())
	},
})

function renderNode<E extends NodeElement>(fn: RenderFunction<E>, options?: {shadowRoot?: boolean | object}) {
	return render<E>((host) => html`
		<div class="${{node: true, selected: host.selected}}"
			onmousedown="${host.draggableStart}"
			ontouchstart="${host.draggableStart}">
			<div class="header">
				<label title="${host.id}">${host.name}</label>
			</div>

			<div class="inputs">
				<node-ports inputs id="${host.id}" edges="${host.incoming}"
					ports="${host.inputs.map((i) => ({
						...i,
						mode: host.fields?.find((f) => f.name === i.name)?.mode,
					}))}"></node-ports>
			</div>

			<div class="outputs">
				<node-ports id="${host.id}" edges="${host.outgoing}"
					ports="${host.outputs}"></node-ports>
			</div>

			<div class="content">
				${fn(host)}
			</div>
		</div>
	`.define(NodePorts).style(styles),
	options)
}

interface CustomElement extends HTMLElement {
	[key: string]: any
}

interface NodeComponentOptions extends NodeOptions {
	component?: Hybrids<CustomElement>
}

export function NodeComponent<T extends NodeTemplate>(fn: Op, defaults: any[], options: NodeComponentOptions = {}) {
	options.in = options.in ?? []
	options.out = options.out ?? []

	let customTemplate = !!options.component?.render
	const inputFields = options.in.filter((i) => i.field)

	const component = NodeUI<T>(fn, defaults, options.variants, {
		in: options.in,
		out: options.out,
		fields: nodeComputed((node: Node) => node.inputs.filter((i) => i.field).map((i) => {
			const mode = i.connected.length > 0 ? 'OPAQUE' : 'EDIT'
			return {...i, mode}
		})),
		render: () => html``,
		...options.component,
	} as any)

	if(!customTemplate && inputFields.length > 0) {
		component.render = renderNode(TEMPLATE_BASIC_FIELDS)
	}

	const api = {
		withTemplate,
		define,
	}

	function withTemplate<E extends NodeElement>(template: UpdateFunctionWithMethods<E>) {
		customTemplate = true
		component.render = renderNode((host) => template)

		return api
	}

	function define(tag: string = component?.tag, icon?: string) {
		if(!tag) throw new Error('Cannot define a custom element without a tag.')
		const name = tag.replace(/^node-/i, '')

		component.tag = tag
		component.icon = () => icon
		component.name = () => name

		defineHybrids(tag, component)
		return {name, tag, icon}
	}

	return api
}

export function NodeUI<T extends NodeTemplate>(fn: Op, defaults: any[], variants: Record<string, {fn: Op, out?: PortOptions[]}> = {}, template: T): Hybrids<NodeElement> {
	function connectNode(host, node: Node, invalidate) {
		host.setAttribute('id', node.id)
		host.id = node.id
		host.run = node.run
		host.set = (...args) => {
			// @ts-ignore
			node.set(...args)
			dispatch(host, 'save', {detail: null, bubbles: true})
		}

		node.subscribe(() => invalidate())
		dispatch(host, 'created', {detail: {node}, bubbles: true})
	}

	function connectDraggable(host) {
		const io = Draggable({absolutePositioning: true})
		io.draggableInit(host)
		host.draggableStart = (host, e) => {
			onclick(host, e)
			io.draggableStart(host, e)
		}
		host.draggableDrag = io.draggableDrag
		host.draggableEnd = io.draggableEnd
	}

	function onclick(host, e) {
		dispatch(host, 'select', {detail: {id: host.id, add: e.shiftKey}, bubbles: true})
	}

	return {
		selected: redux(store, ({id}, state) => state.selected.includes(id)),
		// Custom Properties
		...template,
		// state restoration
		incoming: [],
		outgoing: [],
		node: {
			connect: (host, key, invalidate) => {
				let node = create2(fn, defaults, {
					i: template.in,
					o: template.out
				})
				const persistedId = host.getAttribute('id')
				if(persistedId) node.id = persistedId

				connectNode(host, node, invalidate)
				connectDraggable(host)
				host[key] = node
			},
		},
		inputs: <any>nodeComputed((node) => [...node.inputs].map((i: any) => ({
			...i,
			mode: i.connected.length > 0 ? 'OPAQUE' : 'EDIT',
		}))),
		outputs: <any>nodeComputed((node) => [...node.outputs]),
		fields: ({inputs}) => inputs.filter((i) => i.field),
		render: renderNode(template.render),
	} as any
}