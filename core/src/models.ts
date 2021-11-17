import { Datatype as DT } from "./Datatype"

/**
 * An Op (Invoker) describes an atomic operation performed by a Node.
 * An Op always assumes an array of inputs and outputs.
 */
export type Invoker = (...args: any[]) => any[]
export type Op = (...args: any[]) => any[]

/**
 * A Piper maps values between nodes i.e. clamping/validation.
 * Avoid complicated pipers.
 */
export type Piper = (...args: any[]) => object | any[] | ((inputValues?: any[]) => any[])
export const PiedPiper: Piper = (...args: any[]) => [...args]

export interface ConnectedPort {
	id: string,
	port: number,
	type?: DT,
}

export interface PortOptions { name?: string, type?: DT }
export interface Port extends PortOptions {
	value: any,
	connected: ConnectedPort[],
}

export interface ConnectOptions { typeFrom?: DT, typeTo?: DT }

export interface NodeOptions {
	in?: PortOptions[],
	out?: PortOptions[],
	variants?: Record<string, {fn: Op, out: PortOptions[]}>,
}

export interface Node {
	id: string, // uuid
	inputs: Port[],
	outputs: Port[],

	// Triggers an Op execution.
	run: (args?: any[]) => Node,
	// Either provides or produces new inputs. Triggers an Op execution.
	set: (args: object | any[] | ((inputs: any[]) => any[])) => Node,
	// chooses among regex indexed Op variants.
	setOp: (opSignature?: string) => Node,

	// reset a port to default value 
	reset: (port: string | number) => void,

	// connect to other nodes
	pipe: (node: Node, piper?: Piper, options?: ConnectOptions) => Node,
	connect: (outputIdx: number, node: Node, inputIdx: number, options?: ConnectOptions) => Node,
	disconnect: (outputIdx: number, node: Node, inputIdx: number) => Node,

	// side-effects from node updates
	subscribe: (fn: (node: Node) => void) => number,
	unsubscribe: (number) => boolean,
}