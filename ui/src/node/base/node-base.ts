import {html, RenderFunction, dispatch, UpdateFunctionWithMethods, define as defineHybrids, Component, define} from 'hybrids'
import {Node, NodeOptions, create, Op, PortOptions} from '@ndjinn/core'
import {Draggable} from '@auzmartist/cam-el'
import NodePorts from './node-ports'
import styles from './node-base.css'
import store, { NdjinnState, redux } from '../../store/store'
import { NodeElement, NodeElementUI, NodeTemplate } from './models'
import { TEMPLATE_BASIC_FIELDS } from './templates'
import { render } from './node-renderer'
import { getset } from '../../utils/hybrids'
import { kebab } from '../../utils'
import { off } from 'process'
const components = {NodePorts};

const nodeComputed = <T>(fn: (node: Node) => T) => ({
	get: ({node}) => fn(node),
	connect: (host, key, invalidate) => {
		host.node?.subscribe((n) => invalidate())
	},
})

function renderNode<E extends NodeElement>(fn: RenderFunction<E>, options?: {shadowRoot?: boolean | object}) {
	return render((host) => html`
		<div class="${{node: true, selected: host.selected}}"
			onmousedown="${host.draggableStart}"
			ontouchstart="${host.draggableStart}">
			<div class="header">
				<label title="${host.id}">${host.name}</label>
			</div>

			<div class="inputs">
				<node-ports inputs edges="${host.node.connections}"
					ports="${host.node.meta.in.map((input, i) => ({
						...input,
						value: host.node.inputs[i],
						mode: host.fields?.find((f) => f.name === input.name)?.mode,
					}))}"></node-ports>
			</div>

			<div class="outputs">
				<node-ports ports="${host.node.meta.out.map((output, i) => ({
					...output,
					value: host.node.outputs[i],
				}))}"></node-ports>
			</div>

			<div class="content">
				${fn(host)}
			</div>
		</div>
	`.style(styles),
	options)
}

interface CustomElement extends HTMLElement {
	[key: string]: any
}

interface NodeComponentOptions extends NodeOptions {
	component?: Partial<CustomElement>;
	in?: PortOptions[];
	out?: PortOptions[];
	immediate?: boolean;
	outputCount?: number;
}

export const Ndjinn = {
	component: NodeComponent,
}

export function NodeComponent<T extends NodeTemplate>(fn: Op, defaults: any[], options?: NodeComponentOptions, {debug}: {debug?: boolean} = {}) {
	const nodeFnName = kebab(fn.name).toLowerCase();
	const tag = options?.component?.tag || (nodeFnName && `node-${nodeFnName}`)

	let customTemplate = !!options?.component?.render
	const inputFields = options?.in?.filter((i) => i.field)

	const component: Component<NodeElementUI> = {
		tag,
		selected: redux(store, ({id}, state: NdjinnState) => state.selected.includes(id)),

		// state restoration
		incoming: getset([], null, () => {
			
		}),

		inputs: nodeComputed((node: Node) => {
			if(!node.meta?.in) return []
			return [...node.meta.in].map((i: any) => ({
				...i,
				mode: !!node.connections[i] ? 'OPAQUE' : 'EDIT',
			}))
		}),
		fields: nodeComputed((node: Node) => node.meta.in.map((input, i) => {
			const mode = !!node.connections[i] ? 'OPAQUE' : 'EDIT'
			return {...input, name: input.name ?? i, mode, value: node.inputs[i]}
		}).filter((input) => !!input.field)),

		outputs: <any>nodeComputed((node: Node) => [...node.meta.out].map((o: any) => ({
			...o,
		}))),
		node: {
			get: (host, val) => val ?? create(fn, defaults, {
				in: options.in,
				out: options.out,
				immediate: options.immediate,
				outputCount: options.outputCount,
			}),
			connect: (host, key, invalidate) => {
				const node = host[key]
				node.subscribe(() => invalidate())

				const persistedId = host.getAttribute('id')
				if(persistedId) node.id = persistedId
				host.setAttribute('id', node.id)
				host.id = node.id
				host.run = node.run
				host.set = (...args) => {
					// @ts-ignore
					node.set(...args)
					dispatch(host, 'save', {detail: null, bubbles: true})
				}

				host.incoming.forEach((c, i) => {
					if(!c) return
					const detail = ({from: c, to: {id: host.node.id, port: i}})
					dispatch(host, 'connect', {detail, bubbles: true, composed: true})
				})

				dispatch(host, 'created', {detail: {node}, bubbles: true})
				try {
					connectDraggable(host)
				} catch (ex) {
					// swallow issues with unsupported browser touch API
				}
			},
		},

		// mixins
		...options?.component,
	}

	
	if(!customTemplate && inputFields?.length > 0) {
		component.render = <any>renderNode(TEMPLATE_BASIC_FIELDS)
	}
	if(customTemplate) {
		component.render = <any>renderNode(options.component.render)
	}

	const api = {
		define,
	}

	function define(tag?: string, icon?: string) {
		component.tag = tag ?? component.tag
		if(!component.tag) throw new Error('Cannot define a custom element without a tag.')
		const name = component.tag.replace(/^node-/i, '')
		component.name = name
		component.icon = icon

		defineHybrids(component as NodeElement)
		return component
	}

	return api
}

/**
 * @deprecated Use Ndjinn.component()
 */
export function NodeUI<T extends NodeTemplate>(fn: Op, defaults: any[], variants: Record<string, {fn: Op, out?: PortOptions[]}> = {}, template: T): NodeElement {
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

	return {
		selected: redux(store, ({id}, state: NdjinnState) => state.selected.includes(id)),
		// state restoration
		incoming: getset([]),

		node: {
			...getset({}),
			connect: (host, key, invalidate) => {
				let node = create(fn, defaults, {
					in: template.in,
					out: template.out,
				})
				console.log('NODE', node.meta)
				const persistedId = host.getAttribute('id')
				if(persistedId) node.id = persistedId

				connectNode(host, node, invalidate)
				try {
					connectDraggable(host)
				} catch (ex) {
					// swallow issues with unsupported browser touch API
				}

				host[key] = node
			},
		},
		inputs: <any>nodeComputed((node: Node) => {
			if(!node?.meta?.in) return []
			return [...node.meta.in].map((i: any) => ({
				...i,
				mode: !!node.connections[i] ? 'OPAQUE' : 'EDIT',
			}))
		}),
		outputs: <any>nodeComputed((node: Node) => [...node.outputs]),
		fields: ({inputs}) => inputs.filter((i) => i.field),

		// Custom Properties
		...template,
	} as any
}

function connectDraggable(host) {
	const io = Draggable({absolutePositioning: true})
	io.draggableInit(host)
	host.draggableStart = (host, e) => {
		dispatch(host, 'select', {detail: {id: host.id, add: e.shiftKey}, bubbles: true})
		io.draggableStart(host, e)
	}
	host.draggableDrag = io.draggableDrag
	host.draggableEnd = io.draggableEnd
}
