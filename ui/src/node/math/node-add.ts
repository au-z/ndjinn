import {DT} from '@ndjinn/core'
import {define, html} from 'hybrids'
import {NodeUI} from '../base/node-base'

const defaultFn = (a, b) => [[a + b]]
const addArrays = (a, b) => {
	if(!Array.isArray(a)) a = Object.values(a)
	if(!Array.isArray(b)) b = Object.values(b)
	return a.length >= b.length ? [[...a].map((v, i) => v + (b[i] ?? 0))] : [[...b].map((v, i) => v + (a[i] ?? 0))]
}

const NodeAdd = NodeUI(defaultFn, [0, 0], {
	'^(rgb|vec|mat).(&(rgb|vec|mat).)?': {fn: addArrays, out: [{type: DT.vec3}]},
	'.*': {fn: defaultFn, out: [{type: DT.vec3}]},
}, {
	name: 'add',
	tag: 'node-add',
	in: [{type: DT.any, name: 'a'}, {type: DT.any, name: 'b'}],
	out: [{type: DT.any, name: 'sum'}],
	fields: [
		{name: 'a'},
		{name: 'b'},
	],
	render: ({fields, outputs}) => html`<form class="vec">
		${JSON.stringify(outputs[0]?.value)}
	</form>`
})

define('node-add', NodeAdd)
export default NodeAdd