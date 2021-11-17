import {html, render, Hybrids, RenderFunction, dispatch, property, UpdateFunctionWithMethods, define as defineHybrids} from 'hybrids'
import {Node, NodeOptions, create, Op, PortOptions, Port, DT, Piper} from '@ndjinn/core'
import {Draggable} from '@auzmartist/cam-el'
import NodePorts from './node-ports'
import styles from './node-base.css'
import store, { redux } from '../../store/store'

function renderNode<E extends NodeElement>(fn: RenderFunction<E>, options?: {shadowRoot?: boolean | object}) {
	return render<E>((host) => html`
		<div class="${{node: true, selected: host.selected}}"
			onmousedown="${host.draggableStart}"
			ontouchstart="${host.draggableStart}">
			<div class="header">
				<label title="${host.id}">${host.name}</label>
			</div>
			<div class="inputs">
				<node-ports inputs id="${host.id}"
					edges="${host.incoming}"
					ports="${host.inputs.map((i) => ({
						...i,
						mode: host.fields?.find((f) => f.name === i.name)?.mode,
					}))}"></node-ports>
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
	`.define(NodePorts).style(styles), options)
}

const TEMPLATE_BASIC_FIELDS = ({fields}) => html`<form>
	${fields.map((f: Field & Port) => {

		// DEPRECATED
		let attrs: any = {}
		try {
			attrs = attrsFromDT(f.type)
		} catch (ex) {
			console.warn(ex)
		}

		const input = inputFromDT(f.type)

		return html`<cam-box class="field" flex="space-between center">
			<label>${f.name}&nbsp;</label>
			${input ? input(f) : html`
				<cam-input type="${f.inputType || attrs.type || 'text'}" value="${f.value}"
					min="${attrs.min}"
					max="${attrs.max}"
					step="${attrs.step}"
					wrap=${attrs.wrap}
					onupdate="${(host, e) => host.set(({[f.name]: e.detail}))}"
					disabled="${f.mode === FieldMode.SOURCE}"
				></cam-input>
			`}
		</cam-box>`
	})}
</form>`

function inputFromDT(dt: DT): Function | void {
	switch(dt) {
		case DT.uint8: return ({name, value, mode}: Field & Port) => html`<cam-input type="number" autosize
			min="0" max="255" step="1" wrap
			value="${value}"
			onupdate="${(host, e) => host.set(({[name]: e.detail}))}"
			disabled="${mode === FieldMode.OPAQUE}"
		></cam-input>`

		case DT.num: return ({name, value, mode}: Field & Port) => html`<cam-input type="number" autosize
			value="${value}"
			onupdate="${(host, e) => host.set(e.detail)}"
			disabled="${mode === FieldMode.OPAQUE}"
		></cam-input>`
	}
}

function attrsFromDT(dt: DT) {
	const defaults = {type: 'text', min: -Infinity, max: Infinity, step: 1, wrap: false}
	switch (dt) {
		case DT.uint8: return {...defaults, type: 'number', min: 0, max: 255, step: 1, wrap: true}
		case DT.hsl: return {...defaults, type: 'number', min: 0, max: 360, step: 1, wrap: true}
		case DT.num: return {...defaults, type: 'number', step: 'any'}
		case DT.vec:
		case DT.vec:
		case DT.vec2:
		case DT.vec3:
		case DT.rgb:
		case DT.rgba:
		case DT.hsl:
		case DT.hsla:
		case DT.vec4:
		case DT.mat2:
		case DT.mat3:
		case DT.mat4:
		case DT.obj: throw new Error(`Cannot map ${dt} to input attributes.`)
		case DT.str:
		case DT.any:
		default: return defaults
	}
}

export enum FieldMode {
	OPAQUE = 'OPAQUE',
	EDIT = 'EDIT',
	SOURCE = 'SOURCE',
}

export interface Field {
	name: string,
	inputType?: string,
	mode?: FieldMode,
}

export interface NodeTemplate {
	name: string,
	in: any[],
	out: any[],
	fields: Field[],
	render: RenderFunction<any>,
}

export interface NodeElement extends HTMLElement {
	id: string,
	name: string,
	inputs: Port[],
	outputs: Port[],
	fields: Field[],
	allSelected: string[],
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

export interface NodeComponent extends HTMLElement {
	in: PortOptions[],
}

const nodeComputed = <T>(fn: (node: Node) => T) => ({
	get: ({node}) => fn(node),
	connect: (host, key, invalidate) => {
		host.node?.subscribe(() => invalidate())
	},
})

export function NodeComponent<T extends NodeTemplate>(fn: Op, defaults: any[], options: NodeOptions = {}) {
	let customTemplate = !!options.component?.render
	const component = NodeUI<T>(fn, defaults, options.variants, {
		in: options.in,
		out: options.out,
		fields: [],
	} as any)
	if(!component.render) component.render = renderNode(() => html``)

	const api = {
		withFields,
		withTemplate,
		define,
	}

	function withFields(fields: Field[]) {
		if(fields.find((f) => typeof f === 'string')) {
			fields = fields.map((name) => ({name}))
		}

		const mapFields = (node: Node) => {
			return fields.map((f) => {
				const input = node.inputs.find((i) => i.name === f.name)
				if(!input) throw new Error(`Cannot find input matching field name '${f.name}'`);
		
				f.mode = input.connected.length > 0 ? FieldMode.OPAQUE : (f.mode ?? FieldMode.EDIT)
	
				return {
					...input,
					mode: f.mode,
				}
			})
		}
		component.fields = nodeComputed(mapFields)

		if(!customTemplate) {
			component.render = renderNode(TEMPLATE_BASIC_FIELDS)
		}

		return api
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

export function NodeUI<T extends NodeTemplate>(fn: Op, defaults: any[], variants: Record<string, {fn: Op, out?: any[]}> = {}, template: T): Hybrids<NodeElement> {
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
				let node = create(fn, defaults, {in: template.in, out: template.out, variants})
				const persistedId = host.getAttribute('id')
				if(persistedId) node.id = persistedId

				connectNode(host, node, invalidate)
				connectDraggable(host)
				host[key] = node
			},
		},
		inputs: <any>nodeComputed((node) => [...node.inputs]),
		outputs: <any>nodeComputed((node) => [...node.outputs]),
		render: renderNode(template.render),
	} as any
}
