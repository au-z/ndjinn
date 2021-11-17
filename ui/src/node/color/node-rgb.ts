import { DT } from '@ndjinn/core'
import { define, html } from 'hybrids'
import { NodeUI } from "../base/node-base"

const fn = (r, g, b) => [{r, g, b}]

const NodeRgb = NodeUI(fn, [255, 255, 255], null, {
	name: 'RGB',
	tag: 'node-rgb',
	in: [
		{type: DT.uint8, name: 'r'},
		{type: DT.uint8, name: 'g'},
		{type: DT.uint8, name: 'b'},
	],
	out: [
		{type: DT.rgb, name: 'color'},
	],
	fields: [
		{name: 'r'},
		{name: 'g'},
		{name: 'b'},
	],
	render: ({fields}) => html`<form>
		${fields.map((f) => html`<cam-box class="field" flex="space-between center">
			<label>${f.name || 'field'}&nbsp;</label>
			<cam-input type="number" value="${f.value}" min="0" max="255" step="0" wrap
				onupdate="${(host, e) => host.set(({[f.name]: parseFloat(e.detail)}))}"
				disabled="${f.mode !== 'EDIT'}"
			></cam-input>
		</cam-box>`)}
	</form>`
})

define('node-rgb', NodeRgb)
export default NodeRgb