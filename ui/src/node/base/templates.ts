import { DT, Port } from '@ndjinn/core'
import { html } from 'hybrids'
import { Field } from './models'

export function inputFromDT(dt: DT): Function | void {
  switch (dt) {
    case DT.bit:
      return ({ name, value, mode }: Field & Port) => html`<cam-input
        type="checkbox"
        toggle
        checked="${value}"
        onupdate="${(host, e) => host.set({ [name]: e.detail })}"
      ></cam-input>`
    case DT.uint8:
      return ({ name, value, mode }: Field & Port) => html`<cam-input
        type="number"
        autosize
        min="0"
        max="255"
        step="1"
        wrap
        value="${parseFloat(value)}"
        onupdate="${(host, e) => host.set({ [name]: parseFloat(e.detail) })}"
        disabled="${mode === 'OPAQUE'}"
      ></cam-input>`

    case DT.deg:
      return ({ name, value, mode }: Field & Port) => html`<cam-input
        type="number"
        autosize
        min="0"
        max="360"
        step="1"
        wrap
        value="${parseFloat(value)}"
        onupdate="${(host, e) => host.set({ [name]: parseFloat(e.detail) })}"
        disabled="${mode === 'OPAQUE'}"
      ></cam-input>`

    case DT.percent:
      return ({ name, value, mode }: Field & Port) => html`<cam-input
        type="number"
        autosize
        min="0"
        max="1"
        step="0.01"
        value="${parseFloat(value)}"
        onupdate="${(host, e) => host.set({ [name]: parseFloat(e.detail) })}"
        disabled="${mode === 'OPAQUE'}"
      ></cam-input>`

    case DT.num:
      return ({ name, value, mode }: Field & Port) => html`<cam-input
        type="number"
        autosize
        value="${parseFloat(value)}"
        onupdate="${(host, e) => host.set({ [name]: parseFloat(e.detail) })}"
        disabled="${mode === 'OPAQUE'}"
      ></cam-input>`

    case DT.str:
      return ({ name, value, mode }: Field & Port) => html`<cam-input
        autosize
        title="${value}"
        value="${value}"
        onupdate="${(host, e) => host.set({ [name]: e.detail })}"
        disabled="${mode === 'OPAQUE'}"
      ></cam-input>`
  }
}

export const TEMPLATE_BASIC_FIELDS = ({ fields }) => html`<form>
  ${fields.map((f: Field & Port) => {
    const input = inputFromDT(f.type)

    return html`<cam-box class="field" flex="space-between center">
      <label>${f.name}&nbsp;</label>
      ${input ? input(f) : html`No default input for Datatype '${f.type}'`}
    </cam-box>`
  })}
</form>`
