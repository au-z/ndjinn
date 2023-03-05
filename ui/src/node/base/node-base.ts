import {html, RenderFunction, dispatch, define as defineHybrids, Component} from 'hybrids'
import {Node, NodeOptions, create, Op, PortOptions} from '@ndjinn/core'
import {Draggable} from '@auzmartist/cam-el'
import NodePorts from './node-ports'
import styles from './node-base.css'
import store, { redux, State } from '../../store/store'
import { NodeElement, NodeElementUI, NodeTemplate } from './models'
import { TEMPLATE_BASIC_FIELDS } from './templates'
import { render } from './node-renderer'
import { getset } from '../../utils/hybrids'
import { kebab } from '../../utils'
const components = {NodePorts};

const nodeComputed = <T>(fn: (node: Node) => T) => ({
	get: ({node}) => fn(node),
	connect: (host, key, invalidate) => {
		host.node?.subscribe((n) => invalidate())
	},
})

function renderNode<E extends NodeElement>(fn: RenderFunction<E>, options?: {shadowRoot?: boolean | object}) {
	return render((host) => html`
		<div class="${{node: true, selected: host.selected, ...host.config}}"
			onmousedown="${host.draggableStart}"
			ontouchstart="${host.draggableStart}"
		>
			<div class="header" onclick="${(host, e) => emit(host, 'select', {id: host.id})}">
				<label title="${host.id}">${host.name}</label>
			</div>

			<div class="inputs">
				<node-ports
					inputs
					edges="${host.node.connections}"
					ports="${host.node.meta.in.map((input, i) => ({
						...input,
						value: host.node.inputs[i],
						mode: host.fields?.find((f) => f.name === input.name)?.mode,
					}))}"
				></node-ports>
			</div>

			<div class="outputs">
				<node-ports
					ports="${host.node.meta.out.map((output, i) => ({
						...output,
						value: host.node.outputs[i],
					}))}"
				></node-ports>
			</div>

			<div class="content">
				${fn(host)}
			</div>

			<i class="inspector" onclick="${(host) => console.log(host.node)}"></i>
		</div>
	`.style(styles),
	options)
}

/**
 * @deprecated Use Ndjinn.component()
 */
export function NodeUI<T extends NodeTemplate>(
  fn: Op,
  defaults: any[],
  variants: Record<string, { fn: Op; out?: PortOptions[] }> = {},
  template: T
): NodeElement {
  function connectNode(host, node: Node, invalidate) {
    host.setAttribute('id', node.id)
    host.id = node.id
    host.run = node.run
    host.set = (...args) => {
      // @ts-ignore
      node.set(...args)
      emit(host, 'save')
    }

interface NodeComponentOptions extends NodeOptions {
	component?: Partial<CustomElement>;
	in?: PortOptions[];
	out?: PortOptions[];
	async?: boolean;
	outputCount?: number;
}

  return {
    selected: redux(store, ({ id }, state: NdjinnState) => state.selected.includes(id)),
    // state restoration
    incoming: getset([]),

export function NodeComponent<T extends NodeTemplate>(fn: Op, defaults: any[], options?: NodeComponentOptions, {debug}: {debug?: boolean} = {}) {
	const nodeFnName = kebab(fn.name).toLowerCase();
	const tag = options?.component?.tag || (nodeFnName && `node-${nodeFnName}`)

	let customTemplate = !!options?.component?.render
	const inputFields = options?.in?.filter((i) => i.field)

	const component: Component<NodeElementUI> = {
		tag,
		config: redux(store, (_, state: State) => state.config.node),
		selected: redux(store, ({id}, state: State) => state.selected.includes(id)),

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
				immediate: !options.async,
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

				dispatch(host, 'created', {detail: {node, host}, bubbles: true, composed: true})
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

// function connectDraggable(host) {
//   Draggable({ absolutePositioning: true })(host)
//   io.draggableInit(host)
//   host.draggableStart = (host, e) => {
//     emit(host, 'select', { id: host.id, add: e.shiftKey })
//     io.draggableStart(host, e)
//   }
//   host.draggableDrag = io.draggableDrag
//   host.draggableEnd = io.draggableEnd
// }
