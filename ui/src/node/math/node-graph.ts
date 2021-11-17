import {DT} from '@ndjinn/core'
import { define, html } from 'hybrids'
import { NodeUI } from '../base/node-base'

const fn = (a, b) => [[a, b]]

const NodeGraph = NodeUI(fn, [0, 0], null, {
	name: 'vec2',
	tag: 'node-vec3',
	in: [{type: DT.num, name: 'a'}, {type: DT.num, name: 'b'}],
	out: [{type: DT.vec2, name: 'vec2'}],
	fields: [
		{name: 'a'},
		{name: 'b'},
	],
	render: ({fields}) => html`<form class="vec">
		${fields.map((f) => html`<div class="field vec">
			<cam-input type="number" value="${f.value}"
				onupdate="${(host, e) => host.set(({[f.name]: parseFloat(e.detail)}))}"
				disabled="${f.mode !== 'EDIT'}"></cam-input>
		</div>`)}
	</form>`
})

define('node-graph', NodeGraph)
export default NodeGraph

