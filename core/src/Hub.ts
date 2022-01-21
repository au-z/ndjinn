import { BehaviorSubject } from "rxjs";
import { Op } from "./models";
import { Arr, setEffect } from "./utils";

export interface Hub {
	emitters: BehaviorSubject<any>[],
	set: Function,
	connect: Function,
	outputs: any[],
	inputs: any[],
}

export function create(op: Op, defaults: any[]): Hub {
	const triggers = Arr.range(op.length)
		.map((i) => ({value: defaults[i]}))
		.map((trigger) => new Proxy(trigger, setEffect((value) => run())))

	function set(args: any[] | Record<string, any>) {
		if(Array.isArray(args)) {
			
		} else if(typeof args === 'object') {
			Object.entries(args).forEach(([name, value]: [any, any]) => {
				let idx = isNaN(parseInt(name)) ? name : name
				if(idx > -1) {
					triggers[idx].value = value
				} else {
					throw new Error(`Unrecognized input name '${name}'.`)
				}
			})
		} else if(typeof args === 'function') {

		} else {
			
		}
	}
	
	const emitters = defaults.map((d) => new BehaviorSubject(d))

	function run(args: any[] = triggers.map((t) => t.value)) {
		op(...args).map((output, i) => {
			emitters[i].next(output)
		})
	}

	function connect(from: number, hub: Hub, to: number) {
		emitters[from].subscribe((value) => {
			hub.set({to: value})
		})

		run()
	}

	return {
		emitters,
		set,
		connect,
		get outputs() {
			return emitters.map((e) => e.getValue())
		},
		get inputs() {
			return triggers.map((t) => t.value)
		},
	}
}

// export class Hub {
// 	public outputs: any[];
// 	private triggers: any[];
// 	private emitters: any[];

// 	constructor(
// 		private op: Op,
// 		private defaults: any[],
// 	) {
// 		// build triggers from op function arguments
// 		this.triggers = Arr.range(this.op.length)
// 			.map((i) => ({
// 				value: defaults[i]
// 			}))
// 			.map((trigger) => new Proxy(trigger, setEffect((value) => this.run())))

// 		// build emitters from defaults
// 		this.emitters = this.defaults
// 			.map((d) => new BehaviorSubject())
// 	}

// 	get inputs() {
// 		return this.triggers.map((t) => t.value)
// 	}

// 	run(args: any[] = this.triggers.map((t) => t.value)) {
// 		this.outputs = this.op(...args)
// 		this.emitters.forEach((e, i) => {
// 			e.next(this.outputs[i])
// 		})

// 		return this
// 	}

// 	connect(from: number, hub: Hub, to: number) {
// 		this.emitters[from].subscribe((output) => {
// 			hub.triggers[to].value = output
// 		})

// 		this.run()
// 		return this
// 	}

// 	// disconnect(from: number, hub: Hub, to: number) {
// 	// 	this.emitters[to].unsubscribe(hub.triggers[from])
// 	// }
// }