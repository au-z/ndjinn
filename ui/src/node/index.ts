import { DT } from '@ndjinn/core'
import { Ndjinn } from './base/node-base'
import { HSL, RGB, Swatch } from './color'
import { NodeHttp } from './http/node-http'
import { NodeVec2, NodeVec3, NodeVec4 } from './math/node-vec'
import { NodePrint } from './output/node-json'

export default {
	// NodePolyad,
	// NodeSwatch,

	// ...NodeVec,
	// ...NodeMat,
	// NodeGraph,
	// NodeAdd,
}

const number = (n) => [n]

export const CATALOG = [
	{
		name: '_test_',
		nodes: [
			Ndjinn.component((a, b) => [a + b], [0, 0], {immediate: true}).define('node-add-test'),
		]
	},
	{
		name: 'math',
		nodes: [
			Ndjinn.component(number, [0], {
				in: [{type: DT.num, field: true}],
				out: [{type: DT.num}],
				immediate: true,
			}).define(),
			NodeVec2.define('node-vec2'),
			NodeVec3.define('node-vec3'),
			NodeVec4.define('node-vec4'),
		]
	},
	{
		name: 'http',
		nodes: [
			NodeHttp.define('node-http'),
		],
	},
	{
		name: 'color',
		nodes: [
			RGB.define('node-rgb', 'face'),
			HSL.define('node-hsl', 'invert_colors'),
			Swatch.define('node-swatch', 'preview'),
			// Polyad.define('node-polyad'),
		],
	},
	// {
	// 	name: 'math',
	// 	nodes: [
	// 		NodeComponent((n) => [n], [0], {in: [{name: 'n', type: DT.num, field: true}], out: [{name: 'n', type: DT.num}]})
	// 			.define('node-number', 'straighten'),
	// 		{name: 'Graph', tag: 'node-graph'},
	// 		{name: 'Add', tag: 'node-add', icon: 'add'},
	// 		NodeArithmetic.define('node-arithmetic', 'memory')
	// 	],
	// },
	// {
	// 	name: 'vec/mat',
	// 	nodes: [
	// 		{name: 'vec2', tag: 'node-vec2'},
	// 		Vec3.define('node-vec3'),
	// 		{name: 'vec4', tag: 'node-vec4'},
	// 		{name: 'mat2', tag: 'node-mat2'},
	// 		{name: 'mat3', tag: 'node-mat3'},
	// 		{name: 'mat4', tag: 'node-mat4'},
	// 	]
	// },
	{
		name: 'output',
		nodes: [
			NodePrint.define('node-print', 'print'),
		]
	}
]
