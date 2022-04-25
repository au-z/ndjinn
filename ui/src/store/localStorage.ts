import { Node, NodeEdge } from '@ndjinn/core'
import { NodeElementUI } from '../node/base/models'
import { NodeElement } from "../node/base/node-base"
import { createNodeElement } from '../ui/ndjinn-editor'
import store, { selectAll } from './store'

export function persist(store, storageKey, saveTransform = (state) => state, loadTransform = (state) => state) {
	const load = () => {
		try {
			const serializedState = localStorage.getItem(storageKey)
			if(serializedState == null) return undefined
	
			return loadTransform(JSON.parse(serializedState))
		} catch (ex) {
			return undefined
		}
	}

	const exportAs = (filename = 'ndjinn-graph') => {
		
	}
	
	const save = (state, key = storageKey) => {
		const serializedState = JSON.stringify(saveTransform(state))
		localStorage.setItem(key, serializedState)
	}
	
	store.subscribe(() => {
		try {
			save(store.getState())
		} catch (ex) {
			console.debug(`[persist] to ${storageKey} aborted - ${ex}`)
		}
	})

	return {
		save,
		load,
		exportAs,
	}
}

function serializeNode(node: Node, nodeUI: NodeElement) {
	return {
		tag: nodeUI.tagName,
		id: node.id,
		connections: node.connections.map((c) => ({...c, sub: undefined})),
		sourceValues: node.inputs,
		pos: {
			x: parseFloat(/\d+/.exec(nodeUI.style.left)[0]) || 0,
			y: parseFloat(/\d+/.exec(nodeUI.style.top)[0]) || 0,
		},
	}
}

export function serializeNodeGraph(state) {
	const nodes = Array.from(state.registry).map(([id, node]) => {
		const nodeUI = state.container?.children[id]
		if(!nodeUI) throw new Error(`No matching HTMLElement for node ${node.id}`)
		return serializeNode(node, nodeUI)
	})

	return {
		nodes,
		selected: state.selected,
	}
}

export function deserializeNodeGraph(json) {
	let edges: Record<string, NodeEdge> = {}
	const nodes: NodeElementUI[] = json.nodes.map((n) => {
		const nodeUI: NodeElementUI = createNodeElement(n.tag, n.id, n.pos)
		edges[n.id] = n.connections
		setTimeout(() => {
			if(!n.sourceValues) {
				console.warn('No source values', n)
			}
			const inputs = n.sourceValues?.reduce((vals, val, i) => {
				vals[i] = val
				return vals
			}, {})
			nodeUI.node.set(inputs)
			// HACK: ensure that the set initial values are serialized back to the store
			store.dispatch(selectAll())
			store.dispatch(selectAll())
		}, 0)

		return nodeUI
	})

	return {
		nodes,
		edges,
	}
}
