import {html} from 'hybrids'
import {Ndjinn} from '../base/node-base'
import styles from './mat.css'

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

export const NodeMat2 = Ndjinn.component(fn, [[1, 0, 0, 1]], {
	in: [{type: 'mat2', name: 'in', field: true}],
	out: [{type: 'mat2', name: 'out'}],
	component: {
		rowMajor: false,
		len: () => 2,
		updateMat: ({set, fields, len}) => (i, detail) => {
			const newMat = [...fields[0].value]
			newMat[i] = detail ?? 0
			set({[fields[0].name]: newMat})
		},
		render: renderMat,
	}
})

export const NodeMat3 = Ndjinn.component(fn, [[1, 0, 0, 0, 1, 0, 0, 0, 1]], {
	in: [{type: 'mat3', name: 'in', field: true}],
	out: [{type: 'mat3', name: 'out'}],
	component: {
		rowMajor: false,
		len: () => 3,
		updateMat: ({set, fields, len}) => (i, detail) => {
			const newMat = [...fields[0].value]
			newMat[i] = detail ?? 0
			set({[fields[0].name]: newMat})
		},
		render: renderMat,
	}
})

export const NodeMat4 = Ndjinn.component(fn, [[1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]], {
	in: [{type: 'mat4', name: 'in', field: true}],
	out: [{type: 'mat4', name: 'out'}],
	component: {
		rowMajor: false,
		len: () => 4,
		updateMat: ({set, fields, len}) => (i, detail) => {
			const newMat = [...fields[0].value]
			newMat[i] = detail ?? 0
			set({[fields[0].name]: newMat})
		},
		render: renderMat,
	}
})