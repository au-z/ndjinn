import { DT } from '@ndjinn/core';
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

const renderVecPassThrough = ({fields}) => html`
	<form class="vec">
		${fields[0].value.map((v, i) => html`<div class="field">
			<cam-input type="number" value="${v}" autosize
				onupdate="${(host, e) => host.set({
					[fields[0].name]: fields[0].value.map((v, j) => j === i ? parseFloat(e.detail) : v)
				})}"
				disabled="${fields[0].mode !== 'EDIT'}"></cam-input>
		</div>`)}
	</form>
`

export const NodeVec2 = Ndjinn.component(vec2, [0, 0], {
	in: [
		{type: DT.num, field: true},
		{type: DT.num, field: true}
	],
	out: [{type: DT.vec2, name: 'vec2'}],
	immediate: true,
	component: { render: renderVec }
})

export const NodeVec3 = Ndjinn.component(vec3, [0, 0, 0], {
	in: [
		{type: DT.num, field: true},
		{type: DT.num, field: true},
		{type: DT.num, field: true},
	],
	out: [{type: DT.vec2, name: 'vec3'}],
	immediate: true,
	component: { render: renderVec }
})

export const NodeVec4 = Ndjinn.component(vec4, [0, 0, 0, 0], {
	in: [
		{type: DT.num, field: true},
		{type: DT.num, field: true},
		{type: DT.num, field: true},
		{type: DT.num, field: true},
	],
	out: [{type: DT.vec2, name: 'vec4'}],
	immediate: true,
	component: { render: renderVec }
})

// const fn = (...elements) => [elements];

// export const NodeVec2 = NodeUI(fn, [0, 0], null, {
// 	name: 'vec2',
// 	tag: 'node-vec2',
// 	in: [
// 		{ type: DT.num, name: 'a', field: true },
// 		{ type: DT.num, name: 'b', field: true },
// 	],
// 	out: [{ type: DT.vec2, name: 'vec2' }],
// 	render: renderVec,
// });

// export const Vec3 = NodeComponent(fn, [0, 0, 0], {
// 	in: [
// 		{ type: DT.num, name: 'a', field: true },
// 		{ type: DT.num, name: 'b', field: true },
// 		{ type: DT.num, name: 'c', field: true },
// 	],
// 	out: [{ type: DT.vec3, name: 'vec3' }],
// 	variants: {
// 		'^vec\d*$': {
// 			fn: (...args) => {
// 				const vec = args.find((a) => Array.isArray(a))
// 				console.log(args, vec)
// 				return fn(...vec)
// 			},
// 			in: [
// 				{ type: DT.vec3, name: 'vec3', field: true },
// 			],
// 			component: {
// 				render: renderVecPassThrough,
// 			}
// 		},
// 	},
// 	component: {
// 		tag: 'node-vec3',
// 		render: renderVec,
// 	},
// })

// export const NodeVec3 = NodeUI(fn, [0, 0, 0], null, {
// 	name: 'vec3',
// 	tag: 'node-vec3',
// 	in: [
// 		{ type: DT.num, name: 'a', field: true },
// 		{ type: DT.num, name: 'b', field: true },
// 		{ type: DT.num, name: 'c', field: true },
// 	],
// 	out: [{ type: DT.vec3, name: 'vec3' }],
// 	render: renderVec,
// });

// export const NodeVec4 = NodeUI(fn, [0, 0, 0, 0], null, {
// 	name: 'vec4',
// 	tag: 'node-vec4',
// 	in: [
// 		{ type: DT.num, name: 'a', field: true },
// 		{ type: DT.num, name: 'b', field: true },
// 		{ type: DT.num, name: 'c', field: true },
// 		{ type: DT.num, name: 'd', field: true },
// 	],
// 	out: [{ type: DT.vec4, name: 'vec4' }],
// 	render: renderVec,
// });
