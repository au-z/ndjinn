
import { firstValueFrom } from 'rxjs'
import {Datatype as DT} from '../src/Datatype'
import {create} from '../src/Node'
import {num, rgb} from './node-fixtures'

const val = (n) => [n]

describe('node', () => {
	describe('set', () => {
		let num = create(val, [0])
		it('sets default number', () => {
			expect(num.inputs[0]).toBe(0)
		})
		it('sets new value by array', () => {
			expect(num.set([1]).inputs[0]).toBe(1)
		})
		it('sets the output asynchronously', async () => {
			num.set([2])
			await firstValueFrom(num.run$)
			expect(num.outputs[0]).toBe(2)
		})
		it('sets new value by object', () => {
			expect(num.set({0: 10}).inputs[0]).toBe(10)
		})
		it('sets new value by function', () => {
			expect(num.set((val: any) => [val * 2]).inputs[0]).toBe(20)
		})
	})

	describe('named set', () => {
		let num = create(val, [0], {
			in: [{type: DT.num, name: 'input'}],
			out: [{type: DT.num, name: 'output'}],
		})
		it('sets new value by input name', () => {
			expect(num.set({input: 10}).inputs[0]).toBe(10)
		})
		it('throws on other inputs', () => {
			expect(() => num.set({foobar: 42})).toThrow()
		})
	})

	describe('run', () => {
		let rgbInc = (r, g, b) => [{r: ++r, g: ++g, b: ++b}]
		let color = create(rgbInc, [0, 0, 0])

		it('triggers the node', async () => {
			expect((await color.run()).outputs[0])
				.toMatchObject({r: 1, g: 1, b: 1})
		})
		it('reruns on the inputs', async () => {
			expect((await (await (await color.run())
				.run())
				.run()).outputs[0])
				.toMatchObject({r: 1, g: 1, b: 1})
		})
		it('inputs can be mocked', async () => {
			expect((await color.run([1, 2, 3])).outputs[0])
				.toMatchObject({r: 2, g: 3, b: 4})
		})
	})

	describe('connect', () => {
		let number = num([1])
		let color = rgb([0, 0, 0])

		it.only('connects two nodes', async () => {
			number.connect(0, color, 0)
			// expect(number.outputs[0].connected.length).toBe(1)
			// expect(color.inputs[0].connected.length).toBe(1)
			await firstValueFrom(color.run$)
			expect(color.outputs[0]).toMatchObject({r: 1, g: 0, b: 0})
		})
		it('set propagates to connected nodes', async () => {
			number.set([255])
			await firstValueFrom(color.run$)
			expect(number.outputs[0]).toBe(255)
			expect(color.outputs[0]).toMatchObject({r: 255, g: 0, b: 0})
		})
		it('set propagates to all connected nodes', async () => {
			let color2 = rgb()
			number.connect(0, color2, 1)
			await firstValueFrom(color2.run$)
			expect(number.outputs[0]).toBe(255)
			expect(color2.outputs[0]).toMatchObject({r: 0, g: 255, b: 0})
		})
		// it('connections are saved', () => {
		// 	expect(number.outputs[0].connected.length).toBe(2)
		// 	expect(color.inputs[0].connected.length).toBe(1)
		// })
	})

	describe('pipe', () => {
		
	})

	describe('disconnect', () => {
		let num = create(val, [42])
		let add = create((a, b) => [a + b], [1, 2])

		it('disconnects a node', async () => {
			num.connect(0, add, 0)
			expect(add.inputs[0]).toBe(42)
			await firstValueFrom(add.run$)
			expect(add.outputs[0]).toBe(44) // 42 + 2

			add.disconnect(0)
			await firstValueFrom(add.run$)
			expect(add.outputs[0]).toBe(3) // 1 + 2
		})

		it('disconnected nodes are not invoked', async () => {
			num.set([42])
			await firstValueFrom(num.run$)
			expect(add.outputs[0]).toBe(3) // disconnected
		})
	})
})
