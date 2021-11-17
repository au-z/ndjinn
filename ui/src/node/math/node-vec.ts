import {DT} from '@ndjinn/core'
import { define, html } from 'hybrids'
import { NodeUI } from '../base/node-base'
import styles from './vec.css'

const renderVec = ({fields}) => html`
	<form class="vec">
		${fields.map((f) => html`<div class="field">
			<cam-input type="number" value="${f.value}" autosize
				onupdate="${(host, e) => host.set(({[f.name]: parseFloat(e.detail)}))}"
				disabled="${f.mode !== 'EDIT'}"></cam-input>
		</div>`)}
	</form>
`.style(styles)

const fn = (...elements) => [elements]

export const NodeVec2 = NodeUI(fn, [0, 0], null, {
	name: 'vec2',
	tag: 'node-vec2',
	in: [{type: DT.num, name: 'a'}, {type: DT.num, name: 'b'}],
	out: [{type: DT.vec2, name: 'vec2'}],
	fields: [ {name: 'a'}, {name: 'b'} ],
	render: renderVec
})

define('node-vec2', NodeVec2)

export const NodeVec3 = NodeUI(fn, [0, 0, 0], null, {
	name: 'vec3',
	tag: 'node-vec3',
	in: [{type: DT.num, name: 'a'}, {type: DT.num, name: 'b'}, {type: DT.num, name: 'c'}],
	out: [{type: DT.vec3, name: 'vec3'}],
	fields: [ {name: 'a'}, {name: 'b'}, {name: 'c'} ],
	render: renderVec
})

define('node-vec3', NodeVec3)

export const NodeVec4 = NodeUI(fn, [0, 0, 0, 0], null, {
	name: 'vec4',
	tag: 'node-vec4',
	in: [{type: DT.num, name: 'a'}, {type: DT.num, name: 'b'}, {type: DT.num, name: 'c'}, {type: DT.num, name: 'd'}],
	out: [{type: DT.vec4, name: 'vec4'}],
	fields: [ {name: 'a'}, {name: 'b'}, {name: 'c'}, {name: 'd'} ],
	render: renderVec
})

define('node-vec4', NodeVec4)

