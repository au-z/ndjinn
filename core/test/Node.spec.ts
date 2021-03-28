import {create, DT} from '../src/Node'
import {num, rgb} from './node-fixtures'

const val = (n) => [n]

describe('node', () => {
	describe('set', () => {
		let num = create(val, [0])
		it('sets default number', () => {
			expect(num.outputs[0].value).toBe(0)
		})
		it('sets new value by array', () => {
			expect(num.set([1]).outputs[0].value).toBe(1)
		})
		it('sets new value by object', () => {
			expect(num.set({0: 10}).outputs[0].value).toBe(10)
		})
		it('sets new value by function', () => {
			expect(num.set((val) => [val * 2]).outputs[0].value).toBe(20)
		})
		it('can set the first value by value', () => {
			expect(num.set(360).outputs[0].value).toBe(360)
		})
	})

	describe('named set', () => {
		let num = create(val, [0], {
			in: [{type: DT.num, name: 'input'}],
			out: [{type: DT.num, name: 'output'}],
		})
		it('sets new value by input name', () => {
			expect(num.set({input: 10}).outputs[0].value).toBe(10)
		})
		it('throws on other inputs', () => {
			expect(() => num.set({foobar: 42})).toThrow()
		})
	})

	describe('run', () => {
		let rgb = create((r, g, b) => [{r: ++r, g: ++g, b: ++b}], [0, 0, 0])
		it('triggers the node', () => {
			expect(rgb.run().outputs[0].value)
				.toMatchObject({r: 1, g: 1, b: 1})
		})
		it('reruns on the inputs', () => {
			expect(rgb.run().run().run().outputs[0].value)
				.toMatchObject({r: 1, g: 1, b: 1})
		})
		it('inputs can be mocked', () => {
			expect(rgb.run([1, 2, 3]).outputs[0].value)
				.toMatchObject({r: 2, g: 3, b: 4})
		})
	})

	describe('connect', () => {
		let number = num([1])
		let color = rgb([0, 0, 0])
		it('connects two nodes', () => {
			number.connect(0, color, 0)
			expect(number.outputs[0].connected.length).toBe(1)
			expect(color.inputs[0].connected.length).toBe(1)
			expect(color.outputs[0].value).toMatchObject({r: 1, g: 0, b: 0})
		})
		it('set propagates to connected nodes', () => {
			number.set([255])
			expect(number.outputs[0].value).toBe(255)
			expect(color.outputs[0].value).toMatchObject({r: 255, g: 0, b: 0})
		})
		it('set propagates to all connected nodes', () => {
			let color2 = rgb()
			number.connect(0, color2, 1)
			expect(number.outputs[0].value).toBe(255)
			expect(color2.outputs[0].value).toMatchObject({r: 0, g: 255, b: 0})
		})
		it('connections are saved', () => {
			expect(number.outputs[0].connected.length).toBe(2)
			expect(color.inputs[0].connected.length).toBe(1)
		})
	})

	describe('pipe', () => {
		
	})

	describe('disconnect', () => {
		let num = create(val, [42])
		let add = create((a, b) => [a + b], [1, 2])

		it('disconnects a node', () => {
			num.connect(0, add, 0)
			expect(num.outputs[0].connected.length).toBe(1)
			expect(add.inputs[0].connected.length).toBe(1)
			expect(add.outputs[0].value).toBe(44) // 42 + 2

			num.disconnect(0, add, 0)
			expect(num.outputs[0].connected.length).toBe(0)
			expect(add.inputs[0].connected.length).toBe(0)
			expect(add.outputs[0].value).toBe(3)
		})

		it('disconnected nodes are not invoked', () => {
			num.set({0: 10})
			expect(add.outputs[0].value).toBe(3)
		})
	})
})
