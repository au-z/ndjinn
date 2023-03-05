import { html } from 'hybrids'
import { Ndjinn } from "../base/node-base"

const bitMash = {
	in: [
		{type: 'bit', name: 'a'},
		{type: 'bit', name: 'b'},
	],
	out: [
		{type: 'bit', name: 'out'},
	],
	component: {
		render: ({}) => html`<form></form>`
	},
}

export const NodeBit = Ndjinn.component((bit) => [bit], [false], {
	in: [{type: 'bit', name: 'val', field: true}],
	out: [{type: 'bit', name: 'val'}],
	component: {
		render: ({fields: [bit]}) => html`<form>
			<div class="field">
				<label>${bit.name}</label>
				<cam-input type="checkbox" toggle
					value="${bit.value}"
					oninput="${(host, e) => host.set({0: e.detail})}"></cam-input>
			</div>
		</form>`
	}
})

export const NodeNot = Ndjinn.component((a) => [!a], [false], {
	in: [{type: 'bit', name: 'val'}],
	out: [{type: 'bit', name: 'not'}],
	render: ({}) => html`<form></form>`
})

export const NodeAnd = Ndjinn.component((a, b) => [a && b], [false, false], {
	...bitMash,
})

export const NodeNand = Ndjinn.component((a, b) => [!(a && b)], [false, false], {
	...bitMash,
})

export const NodeOr = Ndjinn.component((a, b) => [a && b], [false, false], {
	...bitMash,
})

export const NodeXor = Ndjinn.component((a, b) => [!a === b], [false, false], {
	...bitMash,
})
