import { Port, PortOptions } from "@ndjinn/core";
import { RenderFunction } from "hybrids";

// TODO: maybe don't use
export enum FieldMode {
	OPAQUE = 'OPAQUE',
	EDIT = 'EDIT',
	SOURCE = 'SOURCE',
}

export interface Field {
	name: string,
	inputType?: string,
	mode?: FieldMode,
}

export interface NodeTemplate {
	name?: string,
	tag: string,
	in: any[],
	out: any[],
	// deprecated
	fields?: Field[],
	render: RenderFunction<any>,
}

export interface NodeElement extends HTMLElement {
	id: string,
	name: string,
	inputs: Port[],
	outputs: Port[],
	fields: Field[],
	allSelected: string[],
	selected: boolean,
	incoming: any[],
	outgoing: any[],
	set: (args: any[] | object) => void,
	run: () => void,
	select: (host, e) => void,
	draggableStart: (host, e) => void,
	draggableEnd: (host, e) => void,
	draggableDrag: (host, e) => void,
}

export interface NodeComponent extends HTMLElement {
	in: PortOptions[],
}