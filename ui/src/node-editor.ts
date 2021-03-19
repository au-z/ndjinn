import {define, html} from 'hybrids'
import styles from './node-editor.css'

const registry = new Map()

function onrun(host, {detail: {node}}) {
	registry.get(node.id).run()
}

function onset(host, {detail: {node, args}}) {
	registry.get(node.id).set(args)
	console.log(registry)
}

function onconnect(host, {detail: {from, to}}) {
	const fromNode = registry.get(from[0])
	const toNode = registry.get(to[0])
	fromNode.connect(from[1], toNode, to[1])
	console.log(registry)
}

function oncreated(host, {detail: {node}}) {
	registry.set(node.id, node)
}

function ondeleted(host, {detail: {el}}) {
	console.log('deleted', el)
}

const edge = {
	from: null,
	to: null,
}

function onconnectFrom(host, {detail: {id, port}}) {
	edge.from = {id, port}
	if(edge.from && edge.to) connect(edge.from, edge.to)
}

function onconnectTo(host, {detail: {id, port}}) {
	edge.to = {id, port}
	if(edge.from && edge.to) connect(edge.from, edge.to)
}

function connect(from, to) {
	const fromNode = registry.get(from.id)
	const toNode = registry.get(to.id)
	if(!fromNode) throw new Error('Cannot find source node.')
	if(!toNode) throw new Error('Cannot find destination node.')

	fromNode.connect(from.port, toNode, to.port)
	edge.from = null
	edge.to = null
}

const NodeEditor = {
	registry: (host, val = new Map()) => val,
	render: () => html`<section class="node-editor">
		<slot
			onrun="${onrun}"
			onset="${onset}"
			onconnect="${onconnect}"
			oncreated="${oncreated}"
			ondeleted="${ondeleted}"
			onconnect-from="${onconnectFrom}"
			onconnect-to="${onconnectTo}"
		></slot>
	</section>`.style(styles),
}

define('node-editor', NodeEditor)
export default NodeEditor
