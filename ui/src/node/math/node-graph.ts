import {DT} from '@ndjinn/core'
import { html } from 'hybrids'
import { NodeUI } from '../base/node-base'

const fn = (a, b) => [[a, b]]

export default NodeUI(fn, [0, 0], null, {
	name: 'graph',
	tag: 'node-graph',
	in: [{type: DT.num, name: 'a', field: true}, {type: DT.num, name: 'b', field: true}],
	out: [{type: DT.vec2, name: 'vec2'}],
	render: ({fields}) => html`<form class="vec">
		${fields.map((f) => html`<div class="field vec">
			<cam-input type="number" value="${f.value}"
				onupdate="${(host, e) => host.set(({[f.name]: parseFloat(e.detail)}))}"
				disabled="${f.mode !== 'EDIT'}"></cam-input>
		</div>`)}
	</form>`
})
