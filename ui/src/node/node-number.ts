import {define, html} from 'hybrids'
import {DT, create} from '@ndjinn/core'
import {Node} from './node-base'
import styles from './node-number.css'

const node = create((x) => [x], [0], {
	in: [{type: DT.num, name: 'val'}],
	out: [{type: DT.num, name: 'val'}],
})

const NodeNumber = Node(node, {
	name: 'number',
	min: 0,
	max: Infinity,
	step: 0.01,
	wrap: false,
	fields: [{name: 'val'}],
	render: ({min, max, step, wrap, fields}) => html`
		<form>
			${fields.map((f) => {
				return f.name === 'val' ? html`<div class="field">
					<label>${f.name || 'field'}</label>
					<cam-input type="number" min="${min}" max="${max}" step="${step}" wrap="${wrap}"
						value="${f.value}"
						oninput="${(host, e) => host.set({[f.name]: parseFloat(e.detail)})}"
					></cam-input>
				</div>` :
				html`<small>?</small>`
			})}
		</form>
	`.style(styles),
})

define('node-number', NodeNumber)
export default NodeNumber