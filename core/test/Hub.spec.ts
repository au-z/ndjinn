import {create} from '../src/Hub'
import { HubTrigger } from '../src/models'

describe('hub', () => {
	const val = (n) => [n]
	const rgb = (r, g, b) => [r, g, b]

	describe('run', () => {
		let num = create(val, [1])

		it('lazily runs the node', () => {
			let color = create(rgb, [0, 0, 0])
			num.connect(0, color, 2)

			console.log('num', num.inputs, num.outputs)
			console.log('color', color.inputs, color.outputs)
		})
	})
})