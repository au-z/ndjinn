import {DT} from '@ndjinn/core'
import {define, html} from 'hybrids'
import {NodeComponent, NodeUI} from '../base/node-base'
import {Vector2, Vector3, Vector4} from 'three'
const vec2 = (v: Vector2) => [v.x, v.y]
const vec3 = (v: Vector3) => [v.x, v.y, v.z]
const vec4 = (v: Vector4) => [v.x, v.y, v.z, v.w]

const defaultFn = (a, b) => [[a + b]]

const addArrays = (a, b) => {
	if(!Array.isArray(a)) a = Object.values(a)
	if(!Array.isArray(b)) b = Object.values(b)
	return a.length >= b.length ? [[...a].map((v, i) => v + (b[i] ?? 0))] : [[...b].map((v, i) => v + (a[i] ?? 0))]
}

// const NodeAdd = NodeUI(defaultFn, [0, 0], {
// 	'^(rgb|vec|mat).(&(rgb|vec|mat).)?': {fn: addArrays, out: [{type: DT.vec3}]},
// 	'.*': {fn: defaultFn, out: [{type: DT.vec3}]},
// }, {
// 	name: 'add',
// 	tag: 'node-add',
// 	in: [{type: DT.any, name: 'a'}, {type: DT.any, name: 'b'}],
// 	out: [{type: DT.any, name: 'sum'}],
// 	render: ({outputs}) => html`<form class="vec">
// 		${JSON.stringify(outputs[0]?.value)}
// 	</form>`
// })

// define('node-add', NodeAdd)
// export default NodeAdd

const cross = <T>(a, b, Class = Vector2): T => {
	if(!a || !b) return null
	return new Class(...a).cross(new Class(...b))
}

const dot = <T>(a, b, Class = Vector2): number => {
	if(!a || !b) return 0
	return new Class(...a).dot(new Class(...b))
}

const arithmeticFn = (operator, a, b) => {
	switch(operator.toUpperCase()) {
		case 'ADD': return [a + b]
		case 'SUBTRACT': return [a - b]
		case 'MULTIPLY': return [a * b]
		case 'DIVIDE': return [a / b]
		case 'EXPONENT': return [Math.pow(a, b)]
		case 'MODULO': return [a % b]
	}
}
const vec2vec2 = (operator, a, b) => {
	switch(operator.toUpperCase()) {
		case 'ADD': return addArrays(a, b)
		case 'SUBTRACT': return addArrays(a, b?.map?.((b) => -1 * b))
		case 'DOT': return dot(a, b)
		case 'CROSS': return cross(a, b)
	}
}

const vec3vec3 = (operator, a, b) => {
	switch(operator.toUpperCase()) {
		case 'ADD': return addArrays(a, b)
		case 'SUBTRACT': return addArrays(a, b?.map?.((b) => -1 * b))
		case 'DOT': return [dot<Vector3>(a, b, Vector3)]
		case 'CROSS': return [vec3(cross<Vector3>(a, b, Vector3))]
	}
}

export const NodeArithmetic = NodeComponent(arithmeticFn, ['ADD', 0, 0], {
	in: [
		{type: DT.str, name: 'operator', field: true},
		{type: DT.any, name: 'a'},
		{type: DT.any, name: 'b'},
	],
	out: [
		{type: DT.any, name: 'result'},
	],
	variants: {
		'^(vec2)(&(vec2))?': {fn: vec2vec2, out: [{type: DT.vec}]},
		'^(vec3)(&(vec3))?': {fn: vec3vec3, out: [{type: DT.vec}]},
	},
	component: {
		tag: 'node-arithmetic',
		setOperator: (_) => (host, e) => {
			const operator = e.target?.value || e.path?.[0].value
			host.node.set({operator})
		},
		types: ({inputs}) => [inputs[1], inputs[2]].map((i) => i.connected[0]?.type),
		operators: ({types}) => {
			if(types.every((type) => /^vec/i.exec(type))) {
				return ['Add', 'Subtract', 'Dot', 'Cross']
			}
			return ['Add', 'Subtract', 'Multiply', 'Divide', 'Exponent', 'Modulo']
		},
		render: ({inputs, setOperator, operators}) => html`<form>
			<select value="${inputs[0].value}" onchange="${setOperator}">
				${operators.map((o) => html`
					<option value="${o}">${o}</option>
				`)}
			</select>
		</form>
		<style>
			form {
				margin: 0.5rem 0;
			}
		</style>`
	},
})
