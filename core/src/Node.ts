import { BehaviorSubject, Subject, Subscription } from 'rxjs'
import {v4 as uuid} from 'uuid'
import { Op, Piper, NodeOptions, Port } from './models'
import { Arr, setEffect } from './utils'

class OutputPort<T> extends BehaviorSubject<T> {
	constructor(_value: T) {
		super(_value);
	}
}

export interface Node {
	id: string,
	inputs: any[],
	outputs: Port[],
	connections: {id: string, port: number, sub: Subscription}[],
	meta: {in: any[], out: any[]},
	// Triggers an Op execution
	run: (args?: any[]) => Promise<Node>,
	run$: Subject<void>,
	// Either provides or produces new inputs. Triggers an Op execution
	set: (args: object | any[] | ((inputs: any[]) => any[])) => Node,
	// chooses among regex indexed Op variants
	setOp: (opSignature?: string) => Node,
	// reset a port to default value 
	reset: (port: string | number) => void,
	// connect to other nodes
	pipe: (node: Node, piper?: Piper, transform?: Function) => Node,
	connect: (outputIdx: number, node: Node, inputIdx: number, transform?: Function) => Node,
	edge: (idx: number, node: Node, port: number, sub: Subscription) => void,
	disconnect: (name: number | string) => Node,
	// side-effects from node updates
	subscribe: (fn: (node: Node) => void) => number,
	unsubscribe: (number) => boolean,
}

export function Node(){}
Node.create = create

/**
 * Creates a node wrapping a function invocation context
 * @param fn node function
 * @param defaults initial _inputs
 * @param options optional input and output types
 */
export function create(fn: Op, defaults: any[], options: NodeOptions = {}): Node {
	options = {in: [], out: [], variants: {}, ...options}

	const result = options.immediate && (fn(...defaults) as any[])
	const outputCount = options.out?.length || options.outputCount || result?.length
	if(!outputCount) throw new Error('[ndjinn] Cannot create node without immediate flag or outputCount.')
	
	const _inputs: {value: any}[] = Arr.range(fn.length)
	.map((i) => new Proxy({value: defaults[i]}, setEffect((value) => run())))
	const _outputs: OutputPort<any>[] = [...Array(outputCount)]
	.map((_, i) => new BehaviorSubject(result?.[i] ?? null))

	const meta = {
		in: _inputs.map((_, i) => ({...options.in?.[i]})),
		out: _outputs.map((subject, i) => ({...options.out?.[i]})),
	}

	let connections = new Array<{id: string, port: number, sub: Subscription}>(defaults.length)
	const run$ = new Subject<void>()

	const inputIndexByName = (name) => meta.in?.findIndex((i) => i.name === name)
	
	const piped: Record<string, {node: Node, pipe: Piper}> = {}

	const subscriptions: ((node: Node) => void)[] = []

	const _node: Node = {
		id: uuid(),
		get inputs() {
			return _inputs.map((i) => i.value)
		},
		get outputs() {
			return _outputs.map((o) => o.value)
		},
		connections,
		meta,
		setOp,
		run,
		set,
		pipe,
		connect,
		edge,
		disconnect,
		reset,
		subscribe,
		unsubscribe,
		run$,
	}

	/**
	 * Manually trigger the node calculation.
	 * @param args node function args. default: input values.
	 * @param variant in multi-op node, which input variant to execute.
	 */
	async function run(args: any[] = _inputs.map((i) => i.value)): Promise<Node> {
		let result = fn(...args)
		if(!result?.['then']) result = Promise.resolve(result ?? []) as Promise<any[]>

		(await result).map((value, i) => _outputs[i].next(value))

		subscriptions.forEach((fn) => fn(_node))
		run$.next()

		return _node
	}

	/**
	 * Set new input values and retrigger a node calculation.
	 * @param args array, object, or function defining new input values.
	 * If a single other value type is passed, it's assigned as the first input.
	 */
	function set(args: any[] | Record<string, any> | ((inputValues?: any[]) => any[])): Node {
		const _setInput = (value, idx) => {
			if(idx > _inputs.length) return
			_inputs[idx].value = value
		}
		
		if(Array.isArray(args)) {
			args.forEach(_setInput)
		} else if(typeof args === 'object') {
			Object.entries(args).forEach(([name, value]: [any, any]) => {
				let idx = isNaN(parseInt(name)) ? inputIndexByName(name) : name
				if(idx < 0) throw new Error(`Unrecognized input name '${name}'.`)
				_setInput(value, idx)
			})
		} else if(typeof args === 'function') {
			const newInputs = args(..._inputs.map((i) => i.value))
			newInputs.forEach(_setInput)
		}

		subscriptions.forEach((fn) => fn(_node))

		return _node
	}

	/**
	 * Only used when the node have changed type.
	 */
	function setOp(opType?: string): Node {
		// if(!opType) {
		// 	opType = _inputs.map(({connection}) => connection?.[0]?.type).filter((a) => !!a).join('&')
		// }

		if(!options.variants || Object.keys(options.variants).length === 0) return

		const [regex, variant] = Object.entries(options.variants).find(([pattern]) => {
			return new RegExp(pattern, 'gi').exec(opType)
		}) || ['DEFAULT', {fn, out: []}]

		console.log(opType, '=>', variant)

		if(variant.out) {
			_outputs.forEach((o, i) => variant.out[i] && Object.entries(variant.out[i]).forEach(([property, value]) => {
				o[property] = value
			}))
		}

		fn = variant.fn

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
	 * @param from source output port
	 * @param node destination node
	 * @param to destination node input
	 * @param 
	 * @return the source node
	 */
	function connect(from: number, node: Node, to: number, transform: Function = (val) => val) {
		if(transform) {
			console.log(transform)
		}
		const sub = _outputs[from].subscribe((val) => node.set({[to]: transform(val)}))
		node.edge(to, _node, from, sub);

		return _node
	}

	function edge(idx: number, node: Node, port: number, sub: Subscription) {
		connections[idx] = {id: node.id, port, sub};
	}

	/**
	 * Pipes _outputs to the _inputs of a destination node
	 * @param node destination node
	 * @param pipe map from _outputs to _inputs
	 * @return the destination node
	 * @deprecated Use Node.connect
	 */
	function pipe(node: Node, piper: Piper = PiedPiper, transform?: Function): Node {
		return node
	}
	const PiedPiper = (...args: any[]) => [...args]

	/**
	 * Disconnects an output from a specific input node port.
	 * @param name the destination port index or name
	 */
	function disconnect(name: number | string) {
		let idx = isNaN(parseInt(<string>name)) ? inputIndexByName(name) : name
		connections[idx]?.sub.unsubscribe()
		connections[idx] = undefined

		set({[idx]: defaults[idx]})

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
