import {firstValueFrom} from 'rxjs'
import {create} from '../src/Hub'

describe('hub', () => {
	const val = (n) => [n]
	const rgb = (r, g, b) => [r, g, b]

	describe('basic node API', () => {
		let num = create(val, [1])

		it('exposes the node inputs', () => {
			expect(num.i[0]).toBe(1)
		})

		it('exposes the node outputs', () => {
			expect(num.o[0]).toBe(1)
		})

		it('lazily runs', async () => {
			let color = create(rgb, [0, 0, 0])
			num.connect(0, color, 2)
			await firstValueFrom(color.onrun)
			expect(color.o).toEqual([0, 0, 1])
		})

		describe('setting values', () => {
			let color = create(rgb, [0, 0, 0], {
				i: [{name: 'r'}, {name: 'g'}, {name: 'b'}],
			})

			it('sets inputs from numbered object', () => {
				color.set({0: 255})
				expect(color.i).toEqual([255, 0, 0])
			})

			it('sets inputs from named object', () => {
				color.set({r: 100})
				expect(color.i).toEqual([100, 0, 0])
			})

			it('sets inputs from array', () => {
				color.set([1, 1, 1])
				expect(color.i).toEqual([1, 1, 1])
			})
			
			it('lazily runs when set', () => {
				expect(color.o).toEqual([1, 1, 1])
			})

			it('sets from a function', async () => {
				color.set((r, g, b) => [r * 2, g * 3, b * 4])
				await firstValueFrom(color.onrun)
				expect(color.o).toEqual([2, 3, 4])
			})
		})
	})

	describe('async node API', () => {
		const lazyVal = (n, ms = 0) => new Promise((res) => setTimeout(() => res([n]), ms))

		it('creates the node', (done) => {
			const asyncNode = create(lazyVal, [0])
			expect(asyncNode.o).toEqual([0])

			asyncNode.set({0: 'foo'})
			setTimeout(() => {
				expect(asyncNode.o).toEqual(['foo'])
				done()
			})
		})
	})
})
