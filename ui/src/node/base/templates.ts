import { Port } from "@ndjinn/core"
import { html } from "hybrids"
import { Field } from "./models"

export function inputFromDatatype(dt: string): Function | void {
	switch(dt) {
		case 'uint8': return ({name, value, mode}: Field & Port) => html`<cam-input type="number" autosize
			min="0" max="255" step="1" wrap
			value="${parseFloat(value)}"
			onupdate="${(host, e) => host.set(({[name]: parseFloat(e.detail)}))}"
			disabled="${mode === 'OPAQUE'}"
		></cam-input>`

		case 'deg': return ({name, value, mode}: Field & Port) => html`<cam-input type="number" autosize
			min="0" max="360" step="1" wrap
			value="${parseFloat(value)}"
			onupdate="${(host, e) => host.set(({[name]: parseFloat(e.detail)}))}"
			disabled="${mode === 'OPAQUE'}"
		></cam-input>`

		case 'percent': return ({name, value, mode}: Field & Port) => html`<cam-input type="number" autosize
			min="0" max="1" step="0.01"
			value="${parseFloat(value)}"
			onupdate="${(host, e) => host.set(({[name]: parseFloat(e.detail)}))}"
			disabled="${mode === 'OPAQUE'}"
		></cam-input>`

		case 'num': return ({name, value, mode}: Field & Port) => html`<cam-input type="number" autosize
			value="${parseFloat(value)}"
			onupdate="${(host, e) => host.set(({[name]: parseFloat(e.detail)}))}"
			disabled="${mode === 'OPAQUE'}"
		></cam-input>`

		case 'str': return ({name, value, mode}: Field & Port) => html`<cam-input autosize
			title="${value}"
			value="${value}"
			onupdate="${(host, e) => host.set(({[name]: e.detail}))}"
			disabled="${mode === 'OPAQUE'}"
		></cam-input>`
	}
}

export const TEMPLATE_BASIC_FIELDS = ({fields}) => html`<form>
	${fields.map((f: Field & Port) => {
		const input = inputFromDatatype(f.type)

		return html`<cam-box class="field" flex="space-between center">
			<label>${f.name}&nbsp;</label>
			${input ? input(f) : html`No default input for Datatype '${f.type}'`}
		</cam-box>`
	})}
</form>`