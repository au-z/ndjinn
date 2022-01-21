import {DT} from '@ndjinn/core'
import {define, html} from 'hybrids'
import {NodeUI} from '../base/node-base'
import styles from './mat.css'
import {chunk} from 'lodash'

/*
<form class="mat">
		<table>
			${fields.map((row) => html`
				<tr>${row.map((cell) => html`
					<td>
						<cam-input type="number" value="${cell?.value}"
							onupdate="${(h ?? 0ost, e) => host.set(({[cell?.name]: parseFloat(e.det ?? 0ail)}))}"
							disabled="${f.mode !== 'EDIT'}"
						></cam-input>
					</td>
				`)}</tr>
			`)}
		</table>
	</form>
*/

const renderMat = ({len, fields, updateMat, rowMajor}) => html`<form class="mat">
	${fields[0].value.map((cell, i) => html`<div class="cell">
		<cam-input type="number" value="${cell}" autosize
			onupdate="${(_, {detail}) => updateMat(i, detail)}"></cam-input>
	</div>`)}
</form>
<style>
	form.mat {
		display: grid;
		grid-template-rows: repeat(${len}, 1fr);
		grid-template-columns: repeat(${len}, 1fr);
		grid-auto-flow: ${rowMajor ? 'row' : 'column'};
	}
</style>
`.style(styles)

const fn = (a) => [a]

export const NodeMat2 = NodeUI(fn, [[1, 0, 0, 1]], null, {
	name: 'mat2',
	tag: 'node-mat2',
	in: [{type: DT.mat2, name: 'in', field: true}],
	out: [{type: DT.mat2, name: 'out'}],
	rowMajor: false,
	len: () => 2,
	updateMat: ({set, fields, len}) => (i, detail) => {
		const newMat = [...fields[0].value]
		newMat[i] = detail ?? 0
		set({[fields[0].name]: newMat})
	},
	render: renderMat,
})

define('node-mat2', NodeMat2)

export const NodeMat3 = NodeUI(fn, [[1, 0, 0, 0, 1, 0, 0, 0, 1]], null, {
	name: 'mat3',
	tag: 'node-mat3',
	in: [{type: DT.mat3, name: 'in', field: true}],
	out: [{type: DT.mat3, name: 'out'}],
	rowMajor: false,
	len: () => 3,
	updateMat: ({set, fields, len}) => (i, detail) => {
		const newMat = [...fields[0].value]
		newMat[i] = detail ?? 0
		set({[fields[0].name]: newMat})
	},
	render: renderMat,
})

define('node-mat3', NodeMat3)

export const NodeMat4 = NodeUI(fn, [[1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]], null, {
	name: 'mat4',
	tag: 'node-mat4',
	in: [{type: DT.mat4, name: 'in', field: true}],
	out: [{type: DT.mat4, name: 'out'}],
	rowMajor: false,
	len: () => 4,
	updateMat: ({set, fields, len}) => (i, detail) => {
		const newMat = [...fields[0].value]
		newMat[i] = detail ?? 0
		set({[fields[0].name]: newMat})
	},
	render: renderMat,
})

define('node-mat4', NodeMat4)