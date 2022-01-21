import {define, html} from 'hybrids'
import {DT} from '@ndjinn/core'
import {NodeUI} from './base/node-base'

const fn = (x) => [x]

const NodeNumber = NodeUI(fn, [0], null, {
	name: 'number',
	tag: 'node-number',
	in: [{type: DT.num, name: 'val', field: true}],
	out: [{type: DT.num, name: 'val'}],
	render: ({maxLen, fields}) => html`
		<form>${fields.map((f) => f.name === 'val' ? html`
			<cam-box class="field" flex="space-between center">
				<cam-input type="number" value="${f.value}" autosize
					onupdate="${(host, e) => host.set({[f.name]: parseFloat(e.detail)})}"
				></cam-input>
			</cam-box>` : html`<small>?</small>`)}
		</form>`,
})

define('node-number', NodeNumber)
export default NodeNumber