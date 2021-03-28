import {define, html, Hybrids} from 'hybrids'
import Mousetrap from 'mousetrap'

import store, {createNode, connectNode, deleteSelected, selectNode, selectAll, redux, saveNodeContainer, reduxTrack, disconnectNode} from './store/store'
import {saveNodeEditor, loadNodeEditor, persist} from './store/localStorage'
const {save, load} = persist(store, 'node-editor', saveNodeEditor, loadNodeEditor)

import styles from './node-editor.css'
import { NodeElement } from './node/node-base'
import { debounce } from './utils'

const catalog = [
	{
		name: 'color',
		nodes: [
			{name: 'HSL', tag: 'node-hsl', icon: 'invert_colors'},
			{name: 'Swatch', tag: 'node-swatch', icon: 'preview'},
		],
	},
	{
		name: 'math',
		nodes: [
			{name: 'Number', tag: 'node-number'},
		],
	},
]

function oncreated(host, {detail: {node}}) {
	store.dispatch(createNode(node))
}

function onselect(host, {detail: {id, add}}) {
	store.dispatch(selectNode(id, add))
}

const edge = {
	from: null,
	to: null,
}

function onconnectFrom(host, {detail: {id, port}}) {
	edge.from = {id, port}
	if(edge.from && edge.to) {
		store.dispatch(connectNode(edge.from, edge.to))
		edge.from = null
		edge.to = null
	}
}

function onconnectTo(host, {detail: {id, port}}) {
	edge.to = {id, port}
	if(edge.from && edge.to) {
		store.dispatch(connectNode(edge.from, edge.to))
		edge.from = null
		edge.to = null
	}
}

function onconnect(host, {detail: {from, to}}) {
	store.dispatch(connectNode(from, to))
	// fromNode.connect(from[1], toNode, to[1])
}

function ondisconnect(host, {detail: {from, to}}) {
	store.dispatch(disconnectNode(from, to))
}

const onsave = debounce(() => save(store.getState()), 200)

function addNode(host, {detail: {tag}}) {
	const menu = host.render().querySelector('cam-hotkey-toggle#add-node')
	menu.value = false

	const nodeEl = createNodeElement(tag, null, host.actionMousePos)
	host.container.appendChild(nodeEl)
}

export function createNodeElement(tag, id?, pos = {x: 0, y: 0}): NodeElement {
	const nodeEl = document.createElement(tag)
	if(id) nodeEl.setAttribute('id', id)
	nodeEl.style.left = `${pos.x}px`
	nodeEl.style.top = `${pos.y}px`
	return nodeEl
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

function deleteNodes(host, e) {
	store.dispatch(deleteSelected())
	host.selected.forEach((id) => {
		host.container.removeChild(host.container.children[id])
	})
}

const NodeEditor: Hybrids<NodeEditor> = {
	...useMouse,
	actionMousePos: {
		get: (host, val = {x: 0, y: 0}) => val,
		set: (host, val) => val,
	},
	debug: false,
	selected: redux(store, (state) => state.selected),
	registry: redux(store, (state) => state.registry),
	onmousemove: () => (host, e) => {
		host.mouse = {x: e.pageX, y: e.pageY}
	},
	hotkeys: {
		connect: (host, key, invalidate) => {
			Mousetrap(host).bind('x', deleteNodes.bind(null, host))
			Mousetrap(host).bind('a', () => store.dispatch(selectAll()))
		},
	},
	container: reduxTrack(store, {
		get: ({render}) => render().querySelector('node-canvas'),
		observe: (host, container, last) => {
			if(!!last || !container) return
			if(host.load) {
				host.load.nodes.forEach((n) => container.appendChild(n))
			}
		}
	}, saveNodeContainer),

	load: {connect: (host, key, invalidate) => {
		host[key] = load()
	}},

	render: ({debug, registry, onmousemove, actionMousePos}) => html`
	<section tabindex="0" class="node-editor grid" onmousemove="${onmousemove}">
		<node-canvas nodes="${registry}" debug=${debug}
			onselect=${onselect}
			oncreated="${oncreated}"
			onconnect="${onconnect}"
			onconnect-from="${onconnectFrom}"
			onconnect-to="${onconnectTo}"
			ondisconnect="${ondisconnect}"
			onsave="${onsave}"
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
