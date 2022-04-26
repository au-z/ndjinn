import { html } from 'hybrids';
import { Ndjinn } from '../base/node-base';
import styles from './vec.css';

export const vec2 = (a, b) => [[a, b]]
export const vec3 = (a, b, c) => [[a, b, c]]
export const vec4 = (a, b, c, d) => [[a, b, c, d]]

export const renderVec = ({ fields }) =>
	html`
		<form class="vec">
			${fields.map((f) => html`<div class="field">
				<cam-input type="number" value="${f.value}" autosize
					onupdate="${(host, e) => host.set({ [f.name]: parseFloat(e.detail) })}"
					disabled="${f.mode !== 'EDIT'}"></cam-input>
			</div>`)}
		</form>
	`.style(styles);

export const NodeVec2 = Ndjinn.component(vec2, [0, 0], {
	in: [
		{type: 'num', field: true},
		{type: 'num', field: true}
	],
	out: [{type: 'vec2', name: 'vec2'}],
	immediate: true,
	component: { render: renderVec }
})

export const NodeVec3 = Ndjinn.component(vec3, [0, 0, 0], {
	in: [
		{type: 'num', field: true},
		{type: 'num', field: true},
		{type: 'num', field: true},
	],
	out: [{type: 'vec3', name: 'vec3'}],
	immediate: true,
	component: { render: renderVec }
})

export const NodeVec4 = Ndjinn.component(vec4, [0, 0, 0, 0], {
	in: [
		{type: 'num', field: true},
		{type: 'num', field: true},
		{type: 'num', field: true},
		{type: 'num', field: true},
	],
	out: [{type: 'vec4', name: 'vec4'}],
	immediate: true,
	component: { render: renderVec }
})
