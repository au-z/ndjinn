import {createStore} from 'redux'
import {Node} from '@ndjinn/core'
const devtools = (<any>window).__REDUX_DEVTOOLS_EXTENSION__ && (<any>window).__REDUX_DEVTOOLS_EXTENSION__()

export interface DatatypeConfig {
	parent?: string,
	color?: string;
	min?: number;
	max?: number;
	step?: number;
}

export type DatatypeMap = Record<string, DatatypeConfig>

export interface NdjinnState {
	container: HTMLElement,
	registry: Map<string, Node>,
	config: {
		node: {
			inspect: boolean,
		},
		datatypes: DatatypeMap,
		transforms: any,
	},
	selected: string[],
}
export type State = NdjinnState

const STATE: State = {
	container: null,
	registry: new Map(),
	config: {
		node: {
			inspect: false,
		},
		datatypes: {} as DatatypeMap,
		transforms: {}
	},
	selected: [],
}

const reducers = {
	SET_DATATYPES: (state: State, datatypes: DatatypeMap) => {
		state.config.datatypes = datatypes
		return state
	},
	SET_TRANSFORMS: (state: State, transforms) => {
		state.config.transforms = transforms
		return state
	},
	SET_NODE_CONFIG: (state: State, {property, value}) => {
		state.config.node[property] = value;
	},
	SAVE_CONTAINER: (state: State, el: HTMLElement) => {
		state.container = el
		return state
	},
	CREATE_NODE: (state: State, node: Node) => {
		state.registry.set(node.id, node)
		return state
	},
	CONNECT_NODE: (state: State, {from, to}) => {
		const fromNode = state.registry.get(from.id)
		const toNode = state.registry.get(to.id)

		let transform
		if(from.type != to.type) {
			transform = findTransform(state, from.type, to.type);
		}
		if(fromNode && toNode) fromNode.connect(from.port, toNode, to.port, transform);
		else console.debug('[store][connect] cannot connect two nodes which do not exist')
		return state
	},
	DISCONNECT_NODE: (state: State, {from, to}) => {
		const toNode = state.registry.get(to.id)
		if(toNode) toNode.disconnect(to.port);
		else console.debug('[store][disconnect] node not found')
		return state
	},
	DELETE_NODE: (state: State, node: Node) => {
		node.connections.forEach((edge: any) => edge?.sub?.unsubscribe())
		state.registry.delete(node.id)
		return state
	},
	DELETE_SELECTED: (state: State) => {
		state.selected.forEach((id) => {
			const node = state.registry.get(id)
			node && reducers.DELETE_NODE(state, node)
		})
		state.selected = []
		return state
	},
	SELECT_NODE: (state: State, {id, append}) => {
		state.selected = append ? [...state.selected, id] : [id]
		return state
	},
	SELECT_NODES: (state: State, {ids}) => {
		state.selected = ids
		return state
	},
	SELECT_ALL: (state: State) => {
		state.selected = state.selected.length === 0 ? Array.from(state.registry).map(([id]) => id) : []
		return state
	},
}

function findTransform(state: State, sourceDT: string, destDT: string) {
	let source = sourceDT
	let config = state.config.datatypes[source]
	while(!state.config.transforms[source]?.[destDT] && config.parent) {
			source = config.parent
			config = state.config.datatypes[source]
	}
	return state.config.transforms[source]?.[destDT]
}

const storeConfig = (state = STATE, {type, value}) => {
	const reduce = reducers[type]
	return reduce ? reduce(state, value) : state
}

export default createStore(storeConfig, devtools)

export const setDatatypes = (datatypes: DatatypeMap) => ({type: 'SET_DATATYPES', value: datatypes})
export const setTransforms = (transforms: Record<string, Record<string, Function>>) => ({type: 'SET_TRANSFORMS', value: transforms})
export const setNodeConfig = (property, value) => ({type: 'SET_NODE_CONFIG', value: {property, value}})
export const saveNodeContainer = (el: HTMLElement) => ({type: 'SAVE_CONTAINER', value: el})
export const createNode = (node) => ({type: 'CREATE_NODE', value: node})
export const connectNode = (from, to) => ({type: 'CONNECT_NODE', value: {from, to}})
export const disconnectNode = (from, to) => ({type: 'DISCONNECT_NODE', value: {from, to}})
export const deleteNode = (node) => ({type: 'DELETE_NODE', value: node})
export const deleteSelected = () => ({type: 'DELETE_SELECTED', value: null})
export const selectNode = (id, append = false) => ({type: 'SELECT_NODE', value: {id, append}})
export const selectNodes = (ids) => ({type: 'SELECT_NODES', value: {ids}})
export const selectAll = () => ({type: 'SELECT_ALL', value: null})

export function redux<E, S, T>(store, mapState?: (host: E, state: S) => T) {
	const get = mapState ? (host) => mapState(host, store.getState()) : () => store.getState()

	return {
		get,
		connect: (host, key, invalidate) => store.subscribe(() => {
			if(host[key] !== get(host)) invalidate()
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
