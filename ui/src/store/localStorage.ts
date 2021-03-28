import {Node} from '@ndjinn/core'
import { createNodeElement } from '../node-editor'
import { NodeElement } from "../node/node-base"

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

	const exportAs = (filename = 'node_editor') => {
		
	}
	
	const save = (state) => {
		const serializedState = JSON.stringify(saveTransform(state))
		localStorage.setItem(storageKey, serializedState)
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

function jsonNode(node: Node, nodeUI: NodeElement) {
	return {
		tag: nodeUI.tagName,
		id: node.id,
		inputValues: node.inputs.map((i) => i.value),
		pos: {
			x: parseFloat(/\d+/.exec(nodeUI.style.left)[0]) || 0,
			y: parseFloat(/\d+/.exec(nodeUI.style.top)[0]) || 0,
		},
		incoming: node.inputs.map((i) => i.connected), // incoming connections
		outgoing: node.outputs.map((o) => o.connected), // outgoing connections
	}
}

export function saveNodeEditor(state) {
	const nodes = Array.from(state.registry).map(([id, node]) => {
		const nodeUI = state.container?.children[id]
		if(!nodeUI) throw new Error(`No matching HTMLElement for node ${node.id}`)
		return jsonNode(node, nodeUI)
	})

	return {
		nodes,
		selected: state.selected,
	}
}

export function loadNodeEditor(json) {
	const graph = {
		nodes: json.nodes.map((n) => {
			const nodeUI = createNodeElement(n.tag, n.id, n.pos)
			nodeUI.incoming = n.incoming
			nodeUI.outgoing = n.outgoing
			setTimeout(() => nodeUI.set(n.inputValues), 25)
			return nodeUI
		})
	}

	return graph
}
