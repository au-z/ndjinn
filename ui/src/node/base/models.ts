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
  name?: string
  tag: string
  in: any[]
  out: any[]
  // deprecated
  fields?: Field[]
  render: RenderFunction<any>
}

export interface NodeComponent extends HTMLElement {
  in: PortOptions[]
}
