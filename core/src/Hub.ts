import {v4 as uuid} from 'uuid'
import {BehaviorSubject, isObservable, Subject, Subscription} from 'rxjs'
import {PortOptions} from './models'
import {Arr, setEffect} from './utils'

export interface Node {
	id: string,
	set: (args: object | any[] | ((args: any[]) => any[])) => Node,
	// triggers an Op execution
	run: (args?: any[]) => Promise<Node>,
	// connect to other nodes
	connect: (from: number, node: Node, to: number) => Node,
	disconnect: (port: string | number) => Node,
	// subscriptions
	onrun: Subject<void>,
	// existing IO values
	i: any[],
	o: any[],
	// metadata
	meta: NodeConfig,
}

export interface NodeConfig {
	i?: PortOptions[],
	o?: PortOptions[],
}

export type Op = (...args: any[]) => any[] | Promise<any[]>
export type OpMap = Record<string, Op>

export function create(op: Op | OpMap, defaults: any[], config?: NodeConfig): Node {
	const inputs = Arr.range(op.length)
		.map((i) => ({value: defaults[i]}))
		.map((trigger) => new Proxy(trigger, setEffect((value) => run())))

	const outputs = defaults.map((d) => new BehaviorSubject(d))
	
	const connections = new Array<Subscription>(defaults.length)
	const onrun = new Subject<void>()

	const Node: Node = {
		id: uuid(),
		set,
		run,
		connect,
		disconnect,
		onrun,
		get meta() {
			return {...config}
		},
		get i() {
			return inputs.map((t) => t.value)
		},
		get o() {
			return outputs.map((e) => e.getValue())
		},
	}

	function set(args: object | any[] | ((...opArgs: any[]) => any[]), sub?: Subscription): Node {
		const _setInput = (value, idx) => {
			if(idx >= inputs.length) return
			inputs[idx].value = value
			connections[idx] = sub
		}

		if (Array.isArray(args)) {
			args.forEach(_setInput)
		} else if (typeof args === 'object') {
			Object.entries(args).forEach(([name, value]: [string, any]) => {
				let idx = isNaN(parseInt(name)) ? inputIndexFromName(name) : name
				if (idx === -1) throw new Error(`Unrecognized input port name '${name}'.`)
				_setInput(value, idx)
			})
		} else if (typeof args === 'function') {
			const newValues = args(...inputs.map((t) => t.value))
			newValues.forEach(_setInput)
		}

		return Node
	}

	async function run(args: any[] = inputs.map((t) => t.value)): Promise<Node> {
		const emit = (output, i) => {
			if(isObservable(output)) {
				output.subscribe((value) => outputs[i].next(value))
			} else {
				outputs[i].next(output)
			}
		}

		let opResult = (op as Op)(...args)
		if(!opResult['then']) {
			opResult = Promise.resolve(opResult) as Promise<any[]>
		}

		(await opResult).map(emit)
		onrun.next()

		return Node
	}

	function connect(from: number, node: Node, to: number) {
		outputs[from].subscribe((value) => node.set({[to]: value}))

		return Node
	}

	function disconnect(name: number | string) {
		let idx = typeof name === 'string' && isNaN(parseInt(name)) ? inputIndexFromName(name) : name
		connections[idx]?.unsubscribe()

		return Node
	}

	function inputIndexFromName(name: string) {
		return config?.i?.findIndex((i) => i.name === name)
	}

	return Node
}
