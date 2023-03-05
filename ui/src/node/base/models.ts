import { PortOptions } from '@ndjinn/core'
import { RenderFunction } from 'hybrids'

export const FieldModes = {
  OPAQUE: 'OPAQUE',
  EDIT: 'EDIT',
  SOURCE: 'SOURCE',
} as const
export type FieldMode = keyof typeof FieldModes

export interface Field {
  name: string
  inputType?: string
  mode?: FieldMode
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
	tag: string,
	id: string,
	name: string,
	inputs: Port[],
	outputs: Port[],
	fields: Field[],
	allSelected: string[],
	selected: boolean,
	incoming: any[],
	node: Node,
	set: (args: any[] | object) => void,
	run: () => void,
	select: (host, e) => void,
	draggableStart: (host, e) => void,
	draggableEnd: (host, e) => void,
	draggableDrag: (host, e) => void,
	render: (host) => (host, target) => void,
}

export interface NodeElementUI extends NodeElement {
	config?: Record<string, any>,
	icon?: string,
}

export interface NodeComponent extends HTMLElement {
  in: PortOptions[]
}
