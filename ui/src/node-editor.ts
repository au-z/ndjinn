import {define, html, Hybrids, property} from 'hybrids'
import {Node} from '@ndjinn/core'
import Mousetrap from 'mousetrap'
import styles from './node-editor.css'

const catalog = [
	{
		name: 'color',
		nodes: [
			{name: 'HSL', tag: 'node-hsl', icon: 'invert_colors'},
			{name: 'Swatch', tag: 'node-swatch', icon: 'preview'},
		]
	},
	{
		name: 'math',
		nodes: [
			{name: 'Number', tag: 'node-number'},
		],
	},
]

function onconnect(host, {detail: {from, to}}) {
	const fromNode = host.registry.get(from[0])
	const toNode = host.registry.get(to[0])
	fromNode.connect(from[1], toNode, to[1])
	console.log(host.registry)
}

function oncreated(host, {detail: {node}}) {
	host.registry.set(node.id, node)
}

function ondeleted(host, {detail: {el}}) {
	console.log('deleted', el)
}

function onselect(host, {detail: {id, add}}) {
	host.selected = add ? [...host.selected, id] : [id] 
}

const edge = {
	from: null,
	to: null,
}

function onconnectFrom(host, {detail: {id, port}}) {
	edge.from = {id, port}
	if(edge.from && edge.to) connect(host, edge.from, edge.to)
}

function onconnectTo(host, {detail: {id, port}}) {
	edge.to = {id, port}
	if(edge.from && edge.to) connect(host, edge.from, edge.to)
}

function connect(host, from, to) {
	const fromNode = host.registry.get(from.id)
	const toNode = host.registry.get(to.id)
	if(!fromNode) throw new Error('Cannot find source node.')
	if(!toNode) throw new Error('Cannot find destination node.')

	fromNode.connect(from.port, toNode, to.port)
	edge.from = null
	edge.to = null
}

function addNode(host, e) {
	const menu = host.render().querySelector('cam-hotkey-toggle#add-node')
	menu.value = false

	const node = document.createElement(e.detail.tag)
	host.container.appendChild(node)
}

function selectAll(host, e) {
	if(host.selected.length > 0) {
		host.selected = []
	} else {
		host.selected = Array.from(host.registry).map(([id]) => id)
	}
}

function deleteSelected(host, e) {
	host.selected.forEach((id) => {
		const node = host.container.children[id]
		if(host.registry.has(id) && node) {
			const candidate: Node = host.registry.get(id)

			// TODO: migrate these into node-base disconnect callback
			candidate.inputs.forEach((input, inputIdx) => {
				input.connected.forEach(({id, idx}) => {
					host.registry.get(id)?.disconnect(idx, candidate, inputIdx).run()
				})
			})
			candidate.outputs.forEach((output, outputIdx) => {
				output.connected.forEach(({id, idx}) => {
					const outputNode = host.registry.get(id)
					outputNode && candidate.disconnect(outputIdx, outputNode, idx).run()
				})
			})

			host.registry.delete(id)
			node.parentElement.removeChild(node)
		} else {
			throw new Error('Could not delete node ' + id)
		}
	})
}

export interface NodeEditor extends HTMLElement {
	[key: string]: any
}

const useMouse = {
	mousePos: {
		connect: (host, key) => {
			host[key] = {x: 0, y: 0}
			document.addEventListener('mousemove', (e) => {
				host[key] = {x: e.clientX, y: e.clientY}
			})
		},
	},
}

function saveMousePos(host, e) {
	host.actionMousePos = {...host.mousePos}
}

const NodeEditor: Hybrids<NodeEditor> = {
	...useMouse,
	actionMousePos: {
		get: (host, val = {x: 0, y: 0}) => val,
		set: (host, val) => val,
	},
	debug: false,
	selected: property([]),
	registry: (host, val = new Map()) => val,
	onmousemove: () => (host, e) => {
		host.mouse = {x: e.pageX, y: e.pageY}
	},
	hotkeys: {
		connect: (host, key, invalidate) => {
			Mousetrap(host).bind('x', deleteSelected.bind(null, host))
			Mousetrap(host).bind('a', selectAll.bind(null, host))
		},
	},
	container: ({render}) => render().querySelector('node-canvas'),
	render: ({debug, registry, onmousemove, actionMousePos}) => html`
	<section tabindex="0" class="node-editor grid" onmousemove="${onmousemove}">
		<node-canvas nodes="${registry}" debug=${debug}
			onselect=${onselect}
			onconnect="${onconnect}"
			oncreated="${oncreated}"
			ondeleted="${ondeleted}"
			onconnect-from="${onconnectFrom}"
			onconnect-to="${onconnectTo}"
		></node-canvas>
		<cam-hotkey-toggle id="add-node" keys="Shift+A" onchange="${saveMousePos}">
			<menu-mouse slot="on" x="${actionMousePos.x}" y="${actionMousePos.y}"
				catalog="${catalog}"
				onselect="${addNode}"></menu-mouse>
		</cam-hotkey-toggle>
	</section>`.style(styles),
}

define('node-editor', NodeEditor)
export default NodeEditor
