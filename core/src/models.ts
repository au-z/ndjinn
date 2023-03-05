import { Datatype } from "./Datatype"

/**
 * An Op (Invoker) describes an atomic operation performed by a Node.
 * An Op always assumes an array of inputs and outputs.
 */
export type Invoker = (...args: any[]) => any[]
export type Op = (...args: any[]) => any[] | Promise<any[]>

/**
 * A Piper maps values between nodes i.e. clamping/validation.
 * Avoid complicated pipers.
 */
export type Piper = (...args: any[]) => object | any[] | ((inputValues?: any[]) => any[])
export const PiedPiper: Piper = (...args: any[]) => [...args]

export interface PortOptions { name?: string, type?: Datatype, field?: boolean }

export interface Port extends PortOptions {
	value: any,
}

export interface HubTrigger extends Port {
	receive: (val) => void;
}
export interface HubEmitter extends Port {
	emit: (val) => void;
}

export interface ConnectOptions { typeFrom?: Datatype, typeTo?: Datatype }

export interface NodeOptions {
	in?: PortOptions[],
	out?: PortOptions[],
	immediate?: boolean, // run immediately
	outputCount?: number, // number of outputs for non-immediate nodes
	variants?: Record<string, {fn: Op, out?: PortOptions[]}>,
}
