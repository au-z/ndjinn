import {define, html} from 'hybrids'
import {DT} from '@ndjinn/core'
import {NodeUI} from './base/node-base'

const fn = (x) => [x]

const NodeNumber = NodeUI(fn, [0], {
	name: 'number',
	in: [{type: DT.num, name: 'val'}],
	out: [{type: DT.num, name: 'val'}],
	fields: [{name: 'val'}],
	render: ({fields}) => html`
		<form>${fields.map((f) => f.name === 'val' ? html`
			<div class="field">
				<label>${f.name || 'field'}</label>
				<cam-input type="number" value="${f.value}"
					oninput="${(host, e) => host.set({[f.name]: parseFloat(e.detail)})}"
				></cam-input>
			</div>` : html`<small>?</small>`)}
		</form>
		<style>
			cam-input::part(input) {
				width: 5rem;
			}
		</style>
	`,
})

define('node-number', NodeNumber)
export default NodeNumber