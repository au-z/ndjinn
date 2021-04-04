import NodeNumber from './node-number'
import NodeRgb from './color/node-rgb'
import NodeHsl from './color/node-hsl'
import NodePolyad from './color/node-polyad'
import NodeSwatch from './color/node-swatch'
import * as NodeLogic from './logic/nodes'
import NodeJSON from './output/node-json'
import CodeTex from 'code-tex'

export default {
	...NodeLogic,
	NodeNumber,
	NodeRgb,
	NodeHsl,
	NodePolyad,
	NodeSwatch,
	NodeJSON,
	CodeTex,
}

export const CATALOG = [
	{
		name: 'color',
		nodes: [
			{name: 'RGB', tag: 'node-rgb', icon: 'invert_colors'},
			{name: 'HSL', tag: 'node-hsl', icon: 'invert_colors'},
			{name: 'Polyad', tag: 'node-polyad', icon: 'alt_route'},
			{name: 'Swatch', tag: 'node-swatch', icon: 'preview'},
		],
	},
	{
		name: 'math',
		nodes: [
			{name: 'Number', tag: 'node-number'},
		],
	},
	{
		name: 'logic',
		nodes: [
			{name: 'BIT', tag: 'node-bit'},
			{name: 'NOT', tag: 'node-not'},
			{name: 'AND', tag: 'node-and'},
			{name: 'NAND', tag: 'node-nand'},
			{name: 'OR', tag: 'node-or'},
			{name: 'XOR', tag: 'node-xor'},
		],
	},
	{
		name: 'output',
		nodes: [
			{name: 'JSON', tag: 'node-json'},
		],
	},
]
