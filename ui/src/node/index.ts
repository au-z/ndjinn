import NodeNumber from './node-number'
import NodeRgb from './node-rgb'
import NodeHsl from './node-hsl'
import NodeSwatch from './node-swatch'

export default {
	NodeNumber,
	NodeRgb,
	NodeHsl,
	NodeSwatch,
}

export const CATALOG = [
	{
		name: 'color',
		nodes: [
			{name: 'RGB', tag: 'node-rgb', icon: 'invert_colors'},
			{name: 'HSL', tag: 'node-hsl', icon: 'invert_colors'},
			{name: 'Swatch', tag: 'node-swatch', icon: 'preview'},
		],
	},
	{
		name: 'math',
		nodes: [
			{name: 'Number', tag: 'node-number'},
		],
	}
]
