import {v4 as uuid} from 'uuid'
import {Datatype as DT} from './Datatype'

// a function returning input args as an object, array, or another function
type Piper = (...args: any[]) => object | any[] | ((inputValues?: any[]) => any[])

const range = (x) => [...Array(x).keys()]

export interface PortOptions {
	type?: DT,
	name?: string,
}

export interface Port extends PortOptions {
	value: any,
	connected?: {id: string, port: number}[],
}

export interface Node {
	id: string,
	inputs: Port[],
	outputs: Port[],
	run: Function,
	set: Function,
	reset: (port: string | number) => void,
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
	in?: PortOptions[],
	out?: PortOptions[],
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
		reset,
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
	 * Resets a port back to its default
	 * @param port the port to reset
	 */
	function reset(port: string | number) {
		let idx = isNaN(parseInt(<string>port)) ? inputIndexByName(port) : port
		set({[idx]: defaults[idx]})
	}

	/**
	 * Connects an output to a specific node input.
	 * @param outputPort source output port
	 * @param node destination node
	 * @param inputPort destination node input
	 * @return the source node
	 */
	function connect(outputPort: number, node: Node, inputPort: number) {
		const pipe = (...args: any[]) => ({[inputPort]: args[outputPort]})
		piped[`${node.id}:${inputPort}`] = {node, pipe}

		const outputEdges = _node.outputs[outputPort].connected
		if(!outputEdges.find((c) => c.id === node.id && c.port === inputPort)) {
			outputEdges.push({id: node.id, port: inputPort})
		}
		const inputEdges = node.inputs[inputPort].connected
		if(!inputEdges.find((c) => c.id === _node.id && c.port === outputPort)) {
			inputEdges.push({id: _node.id, port: outputPort})
		}
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

		_node.outputs.forEach((o, j) => {
			if(!o.connected.find((e) => e.id === node.id && e.port === j)) {
				o.connected.push({id: node.id, port: j})
			}
		})
		node.inputs.forEach((i, j) => {
			if(!i.connected.find((e) => e.id === _node.id && e.port === j)) {
				i.connected.push({id: _node.id, port: j})
			}
		})

		_node.run()

		return node
	}

	/**
	 * Disconnects an output from a specific input node port.
	 * @param outputPort this input port
	 * @param node source node
	 * @param inputPort source node output
	 */
	function disconnect(outputPort: number, node: Node, inputPort: number) {
		delete piped[`${node.id}:${inputPort}`]

		const outputEdges = _node.outputs[outputPort].connected
		const edgeIdx = outputEdges.findIndex((c) => c.id === node.id && c.port === inputPort)
		if(edgeIdx > -1) {
			outputEdges.splice(edgeIdx, 1)
			node.inputs[inputPort].connected = []
		}
		node.reset(inputPort)

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