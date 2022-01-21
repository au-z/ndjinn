import { Hybrids, RenderFunction, render as renderHybrids, html, dispatch } from 'hybrids'
import {Draggable} from '@auzmartist/cam-el'
import {Node, Port} from '@ndjinn/core'
import { NodeElement } from './models'
import store, { redux } from '../../store/store'
import { NodeComponentOptions } from './node-base'
import { TEMPLATE_BASIC_FIELDS } from './templates'

interface CustomElement extends HTMLElement {
	[key: string]: any,
}

const nodeComputed = <T>(fn: (node: Node) => T) => ({
	get: ({node}) => fn(node),
	connect: (host, key, invalidate) => {
		host.node?.subscribe((n) => invalidate())
	},
})

function render<E extends CustomElement>(content: RenderFunction<E>, options?: {shadowRoot?: boolean | object}) {
	return renderHybrids(({selected}: any) => html`
		<div class="${{node: true, selected}}">
			
		</div>
	`)
}

export function multiNode(chooserFn: (inputs?: Port[]) => {node: Node, options: NodeComponentOptions}) {
	const {node, options} = chooserFn()

	let customTemplate = !!options.component?.render

	return {
		selected: redux(store, ({id}, s) => s.selected.includes(id)),
		// deserialization
		incoming: [],
		outgoing: [],

		node: {
			connect: (host, key, invalidate) => {
				const {node, options} = chooserFn(host.inputs)
				const persistedId = host.getAttribute('id')
				if(persistedId) node.id = persistedId

				reflectNodeProperties(host, node, invalidate)
				connectDraggable(host)

				node.subscribe(() => invalidate())
				dispatch(host, 'created', {detail: {node}, bubbles: true})
			}
		},

		inputs: <any>nodeComputed((node) => [...node.inputs].map((i: any) => ({
			...i,
			mode: i.connected.length > 0 ? 'OPAQUE' : 'EDIT',
		}))),
		outputs: <any>nodeComputed((node) => [...node.outputs]),
		fields: ({inputs}) => inputs.filter((i) => i.field),

		...options.component,

		render: render(
			customTemplate ? options.component.render as any : TEMPLATE_BASIC_FIELDS
		),
	} as Hybrids<CustomElement>
}

// ----------------------------------

function reflectNodeProperties(host, node: Node, invalidate) {
	host.setAttribute('id', node.id)
	host.id = node.id

	host.run = node.run
	host.set = (...args) => {
		// @ts-ignore
		node.set(...args)
		dispatch(host, 'save', {detail: null, bubbles: true})
	}
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
