import {v4 as uuid} from 'uuid'
import {Datatype as DT} from './Datatype'

// a function returning input args as an object, array, or another function
type Piper = (...args: any[]) => object | any[] | ((inputValues?: any[]) => any[])

const range = (x) => [...Array(x).keys()]

interface PutOptions {
	type?: DT,
	name?: string,
}

export interface Put extends PutOptions {
	value: any,
	connected?: {id: string, idx: number}[],
}

export interface Node {
	id: string,
	inputs: Put[],
	outputs: Put[],
	run: Function,
	set: Function,
	pipe: (node: Node, piper?: Piper) => Node,
	connect: (outputIdx: number, node: Node, inputIdx: number) => Node,
	disconnect: (outputIdx: number, node: Node, inputIdx: number) => Node,
	subscribe: (fn: (node: Node) => void) => number,
	unsubscribe: (number) => boolean,
}

const setEffect = (fn) => ({
	set: (inputs, key, value) => {
		try {
			inputs[key] = value
		} catch {
			return false
		} finally {
			fn(value)
			return true
		}
	},
})

/**
 * Creates an node function invocation context by constructing IO metadata.
 * @param fn node function
 * @param options optional input and output types
 */
function invoke(fn: Function, options?: {
	inputTypes?: DT[],
	outputTypes?: DT[],
}) {
	const inputTypes = options?.inputTypes || range(fn.length)?.map((_) => DT.any)
	const outputTypes = options?.outputTypes || []

	return (...i) => {
		let o = fn(...i) || []
		o.__inputs__ = range(fn.length)?.map((_, j) => inputTypes[j] || typeof i[j])
		o.__outputs__ = range(o.length)?.map((_, j) => outputTypes[j] || typeof o[j])
		return o
	}
}

/**
 * Creates a node wrapping a function invocation context
 * @param fn node function
 * @param defaults initial inputs
 * @param options optional input and output types
 */
export function create(fn: Function, defaults: any[], options?: {
	in?: PutOptions[],
	out?: PutOptions[],
}): Node {
	options = {in: [], out: [], ...(options || {})}
	const invoker = invoke(fn, {
		inputTypes: options.in.map((i) => i.type),
		outputTypes: options.out.map((i) => i.type),
	})
	const result = invoker(...defaults)

	let inputs = defaults.map((value, i) => ({
		...options.in[i],
		value,
		connected: [],
	}))
	let outputs = result.map((value, i) => ({
		...options.out[i],
		value,
		connected: [],
	}))

	const inputIndexByName = (name) => inputs.findIndex((i) => i.name === name)
	// const outputIndexByName = (name) => outputs.findIndex((o) => o.name === name)
	
	let proxy = new Proxy(inputs, setEffect(() => run()))

	const piped: Record<string, {node: Node, pipe: Piper}> = {}

	const subscriptions: ((node: Node) => void)[] = []

	const _node: Node = {
		id: uuid(),
		inputs,
		outputs,
		run,
		set,
		pipe,
		connect,
		disconnect,
		subscribe,
		unsubscribe,
	}

	/**
	 * Manually trigger the node calculation.
	 * @param args node function args. default: input values.
	 */
	function run(args = inputs.map((i) => i.value)): Node {
		const result = invoker(...args)
		Object.assign(outputs, result.map((value, i) => ({...outputs[i], value})))
		Object.values(piped).forEach(({node, pipe}) => node.set(pipe(...result)))

		subscriptions.forEach((fn) => fn(_node))
		return _node
	}

	/**
	 * Set new input values and retrigger a node calculation.
	 * @param args array, object, or function defining new input values.
	 * If a single other value type is passed, it's assigned as the first input.
	 */
	function set(args: object | any[] | ((inputValues?: any[]) => any[])): Node {
		if(Array.isArray(args)) {
			Object.assign(proxy, args.map((value, i) => ({...inputs[i], value})))
		} else if(typeof args === 'object') {
			Object.entries(args).forEach(([name, value]: [any, any]) => {
				let idx = isNaN(parseInt(name)) ? inputIndexByName(name) : name
				if(idx > -1) {
					proxy[idx] = ({...inputs[idx], value})
				} else {
					throw new Error(`Unrecognized input name '${name}'.`)
				}
			}) 
		} else if(typeof args === 'function') {
			Object.assign(proxy, args(...inputs.map((i) => i.value)).map((value, i) => ({...inputs[i], value})))
		} else {
			Object.assign(proxy, [args].map((value, i) => ({...inputs[i], value})))
		}

		subscriptions.forEach((fn) => fn(_node))
		return _node
	}

	/**
	 * Connects an output to a specific node input.
	 * @param outputIdx source output index
	 * @param node destination node
	 * @param inputIdx destination node input
	 * @return the source node
	 */
	function connect(outputIdx: number, node: Node, inputIdx: number) {
		const pipe = (...args: any[]) => ({[inputIdx]: args[outputIdx]})
		piped[node.id] = {node, pipe}

		_node.outputs[outputIdx].connected.push({id: node.id, idx: inputIdx})
		node.inputs[inputIdx].connected.push({id: _node.id, idx: outputIdx})
		_node.run()

		subscriptions.forEach((fn) => fn(_node))
		return _node
	}

	/**
	 * Pipes outputs to the inputs of a destination node
	 * @param node destination node
	 * @param pipe map from outputs to inputs
	 * @return the destination node
	 */
	const PiedPiper = (...args: any[]) => [...args]
	function pipe(node: Node, pipe: Piper = PiedPiper): Node {
		piped[node.id] = {node, pipe}

		_node.outputs.forEach((o, j) => o.connected.push({id: node.id, idx: j}))
		node.inputs.forEach((i, j) => i.connected.push({id: _node.id, idx: j}))

		_node.run()

		return node
	}

	/**
	 * Disconnects an output from a specific node input.
	 * @param outputIdx source output index
	 * @param node destination node
	 * @param inputIdx destination node input
	 */
	function disconnect(outputIdx: number, node: Node, inputIdx: number) {
		const edge = _node.outputs[outputIdx].connected.findIndex(({id, idx}) => id === node.id && idx === inputIdx)
		_node.outputs[outputIdx].connected.splice(edge, 1)
		node.inputs[inputIdx].connected = []

		return _node
	}

	function subscribe(fn: (node) => void): number {
		subscriptions.push(fn)
		return subscriptions.length - 1
	}

	function unsubscribe(id: number): boolean {
		if(id > subscriptions.length) return false
		subscriptions.splice(id, 1)
		return true
	}

	return _node
}

export {
	DT,
}