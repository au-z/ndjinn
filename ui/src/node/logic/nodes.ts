import { DT } from '@ndjinn/core'
import { define, html } from 'hybrids'
import { NodeUI } from "../base/node-base"

const bitMash = {
	in: [
		{type: DT.bit, name: 'a'},
		{type: DT.bit, name: 'b'},
	],
	out: [
		{type: DT.bit, name: 'out'},
	],
	render: ({}) => html`<form></form>`
}

const NodeBit = NodeUI((bit) => [bit], [false], {
	name: 'BIT',
	in: [{type: DT.bit, name: 'val', field: true}],
	out: [{type: DT.bit, name: 'val'}],
	render: ({fields: [bit]}) => html`<form>
		<div class="field">
			<label>${bit.name}</label>
			<cam-input type="checkbox" toggle
				value="${bit.value}"
				oninput="${(host, e) => host.set({0: e.detail})}"></cam-input>
		</div>
	</form>`
})
define('node-bit', NodeBit)

const NodeNot = NodeUI((a) => [!a], [false], {
	name: 'NOT',
	in: [{type: DT.bit, name: 'val'}],
	out: [{type: DT.bit, name: 'not'}],
	render: ({}) => html`<form></form>` 
})
define('node-not', NodeNot)

const NodeAnd = NodeUI((a, b) => [a && b], [false, false], {
	name: 'AND',
	...bitMash,
})
define('node-and', NodeAnd)

const NodeNand = NodeUI((a, b) => [!(a && b)], [false, false], {
	name: 'NAND',
	...bitMash,
})
define('node-nand', NodeNand)

const NodeOr = NodeUI((a, b) => [a && b], [false, false], {
	name: 'OR',
	...bitMash,
})
define('node-or', NodeOr)

const NodeXor = NodeUI((a, b) => [!a === b], [false, false], {
	name: 'XOR',
	...bitMash,
})
define('node-xor', NodeXor)

export {
	NodeBit,
	NodeNot,
	NodeAnd,
	NodeNand,
	NodeOr,
	NodeXor,
}
