import {createStore} from 'redux'
import {Node} from '@ndjinn/core'
const devtools = (<any>window).__REDUX_DEVTOOLS_EXTENSION__ && (<any>window).__REDUX_DEVTOOLS_EXTENSION__()

interface NodeEditorState {
	container: HTMLElement,
	registry: Map<string, Node>,
	selected: string[],
}

const STATE: NodeEditorState = {
	container: null,
	registry: new Map(),
	selected: [],
}

const reducers = {
	SAVE_CONTAINER: (state: NodeEditorState, el: HTMLElement) => {
		state.container = el
		return state
	},
	CREATE_NODE: (state: NodeEditorState, node: Node) => {
		state.registry.set(node.id, node)
		return state
	},
	CONNECT_NODE: (state: NodeEditorState, {from, to}) => {
		const fromNode = state.registry.get(from.id)
		const toNode = state.registry.get(to.id)
		if(fromNode && toNode) fromNode.connect(from.port, toNode, to.port)
		else console.debug('[store][connect] cant connect two nodes which do not exist')
		return state
	},
	DISCONNECT_NODE: (state: NodeEditorState, {from, to}) => {
		const fromNode = state.registry.get(from.id)
		const toNode = state.registry.get(to.id)
		if(fromNode && toNode) fromNode.disconnect(from.port, toNode, to.port)
		else console.debug('[store][disconnect] failed to disconnect two nodes')
		return state
	},
	DELETE_NODE: (state: NodeEditorState, node: Node) => {
		node.inputs.forEach((input, toPort) => {
			input.connected.forEach((from) => {
				const fromNode = state.registry.get(from.id)
				fromNode.disconnect(from.port, node, toPort).run()
			})
		})
		node.outputs.forEach((output, outputPort) => {
			output.connected.forEach((to) => {
				const toNode = state.registry.get(to.id)
				node.disconnect(outputPort, toNode, to.port).run()
			})
		})
		state.registry.delete(node.id)
		return state
	},
	DELETE_SELECTED: (state) => {
		state.selected.forEach((id) => {
			const node = state.registry.get(id)
			node && reducers.DELETE_NODE(state, node)
		})
		return state
	},
	SELECT_NODE: (state: NodeEditorState, {id, add}) => {
		state.selected = add ? [...state.selected, id] : [id]
		return state
	},
	SELECT_ALL: (state) => {
		state.selected = state.selected.length === 0 ? Array.from(state.registry).map(([id]) => id) : []
		return state
	},
}

const storeConfig = (state = STATE, {type, value}) => {
	const reduce = reducers[type]
	return reduce ? reduce(state, value) : state
}

export default createStore(storeConfig, devtools)

export const saveNodeContainer = (el: HTMLElement) => ({type: 'SAVE_CONTAINER', value: el})
export const createNode = (node) => ({type: 'CREATE_NODE', value: node})
export const connectNode = (from, to) => ({type: 'CONNECT_NODE', value: {from, to}})
export const disconnectNode = (from, to) => ({type: 'DISCONNECT_NODE', value: {from, to}})
export const deleteNode = (node) => ({type: 'DELETE_NODE', value: node})
export const deleteSelected = () => ({type: 'DELETE_SELECTED', value: null})
export const selectNode = (id, add = false) => ({type: 'SELECT_NODE', value: {id, add}})
export const selectAll = () => ({type: 'SELECT_ALL', value: null})

export function redux(store, mapState) {
	const get = mapState ? () => mapState(store.getState()) : () => store.getState()

	return {
		get,
		connect: (host, key, invalidate) => store.subscribe(() => {
			if(host[key] !== get()) invalidate()
		})
	}
}

export function reduxTrack(store, descriptor, dispatcher) {
	return {
		...descriptor,
		observe: (host, val, last) => {
			descriptor.observe && descriptor.observe(host, val, last)
			dispatcher && store.dispatch(dispatcher(val, last))
		}
	}
}
