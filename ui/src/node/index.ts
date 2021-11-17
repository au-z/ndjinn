import NodeNumber from './node-number'
import NodeRgb from './color/node-rgb'
import NodeHsl from './color/node-hsl'
import NodePolyad from './color/node-polyad'
import NodeSwatch from './color/node-swatch'

import NodeAdd from './math/node-add'
import * as NodeVec from './math/node-vec'
import * as NodeMat from './math/node-mat'
import NodeGraph from './math/node-graph'
import { FieldMode, NodeComponent } from './base/node-base'
import { DT } from '@ndjinn/core'

export default {
	NodeNumber,
	NodeRgb,
	NodeHsl,
	NodePolyad,
	NodeSwatch,

	...NodeVec,
	...NodeMat,
	NodeGraph,
	NodeAdd,
}

const RGB = {
	fn: (r, g, b) => [{r, g, b}],
	defaults: [0, 0, 0],
	in: [
		{type: DT.uint8, name: 'r'},
		{type: DT.uint8, name: 'g'},
		{type: DT.uint8, name: 'b'},
	],
	out: [
		{type: DT.rgb, name: 'color'},
	],
}

export const CATALOG = [
	{
		name: 'color',
		nodes: [
			NodeComponent(RGB.fn, RGB.defaults, {in: RGB.in, out: RGB.out})
				.withFields(['r', 'g', 'b'])
				.define('node-rgb', 'face'),
			// new NodeC((h, s, l) => [{h, s, l}], [0, 1, 0.5])
			// 	.define('node-hsl', 'invert-colors'),
			// {name: 'RGB', tag: 'node-rgb', icon: 'invert_colors'},
			{name: 'HSL', tag: 'node-hsl', icon: 'invert_colors'},
			{name: 'Polyad', tag: 'node-polyad', icon: 'alt_route'},
			{name: 'Swatch', tag: 'node-swatch', icon: 'preview'},
		],
	},
	{
		name: 'math',
		nodes: [
			NodeComponent((n) => [n], [0], {in: [{name: 'n', type: DT.num}], out: [{name: 'n', type: DT.num}]})
				.withFields([{name: 'n', mode: FieldMode.SOURCE}])
				.define('node-number'),
			// {name: 'Number', tag: 'node-number'},
			{name: 'Graph', tag: 'node-graph'},
			{name: 'Add', tag: 'node-add'},
		],
	},
	{
		name: 'vec/mat',
		nodes: [
			{name: 'vec2', tag: 'node-vec2'},
			{name: 'vec3', tag: 'node-vec3'},
			{name: 'vec4', tag: 'node-vec4'},
			{name: 'mat2', tag: 'node-mat2'},
			{name: 'mat3', tag: 'node-mat3'},
			{name: 'mat4', tag: 'node-mat4'},
		]
	}
]
