import { html } from 'hybrids'
import { Ndjinn } from '../..'

const fn = (a, b) => [[a, b]]

export default Ndjinn.component(fn, [0, 0], {
	in: [{type: 'num', name: 'a', field: true}, {type: 'num', name: 'b', field: true}],
	out: [{type: 'vec2', name: 'vec2'}],
	component: {
		render: ({fields}) => html`<form class="vec">
			${fields.map((f) => html`<div class="field vec">
				<cam-input type="number" value="${f.value}"
					onupdate="${(host, e) => host.set(({[f.name]: parseFloat(e.detail)}))}"
					disabled="${f.mode !== 'EDIT'}"></cam-input>
			</div>`)}
		</form>`
	}
})
