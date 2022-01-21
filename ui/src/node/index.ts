import { DT } from '@ndjinn/core'
import NodeNumber from './node-number'
import NodePolyad from './color/node-polyad'
import NodeSwatch from './color/node-swatch'

import NodeAdd, { NodeArithmetic } from './math/node-add'
import * as NodeVec from './math/node-vec'
import * as NodeMat from './math/node-mat'
import NodeGraph from './math/node-graph'
import { NodeComponent } from './base/node-base'
import { HSL, RGB, Swatch } from './color'
import { NodePrint } from './output/node-json'
import { Vec3 } from './math/node-vec'
import { Viewer } from '../output/node-viewer'

export default {
	NodeNumber,
	NodePolyad,
	NodeSwatch,

	...NodeVec,
	...NodeMat,
	NodeGraph,
	NodeAdd,
}

export const CATALOG = [
	{
		name: 'color',
		nodes: [
			RGB.define('node-rgb', 'face'),
			HSL.define('node-hsl', 'invert_colors'),
			Swatch.define('node-swatch', 'preview'),
			{name: 'Polyad', tag: 'node-polyad', icon: 'alt_route'},
		],
	},
	{
		name: 'math',
		nodes: [
			NodeComponent((n) => [n], [0], {in: [{name: 'n', type: DT.num, field: true}], out: [{name: 'n', type: DT.num}]})
				.define('node-number', 'straighten'),
			// {name: 'Number', tag: 'node-number'},
			{name: 'Graph', tag: 'node-graph'},
			{name: 'Add', tag: 'node-add', icon: 'add'},
			NodeArithmetic.define('node-arithmetic', 'memory')
		],
	},
	{
		name: 'vec/mat',
		nodes: [
			{name: 'vec2', tag: 'node-vec2'},
			Vec3.define('node-vec3'),
			{name: 'vec4', tag: 'node-vec4'},
			{name: 'mat2', tag: 'node-mat2'},
			{name: 'mat3', tag: 'node-mat3'},
			{name: 'mat4', tag: 'node-mat4'},
		]
	},
	{
		name: 'output',
		nodes: [
			NodePrint.define('node-print', 'print'),
			Viewer.define('node-viewer', 'print')
		]
	}
]
