import { create, DT } from '../src/Node'

export function num(defaults = [0]) {
	return create((x) => [x], defaults, {
		in: [{type: DT.num, name: 'num'}],
		out: [{type: DT.num, name: 'num'}],
	})
}

export function rgb(defaults = [0, 0, 0]) {
	return create((r, g, b) => [{r, g, b}], defaults, {
		in: [
			{type: DT.num, name: 'r'},
			{type: DT.num, name: 'g'},
			{type: DT.num, name: 'b'},
		],
		out: [
			{type: DT.rgb, name: 'rgb'}
		],
	})
}