
import { firstValueFrom } from 'rxjs'
import {Datatype as DT} from '../src/Datatype'
import {create} from '../src/Node'
import {num, rgb} from './node-fixtures'

describe('node', () => {
	describe('create', () => {
		it('creates a node with immediate invocation', () => {
			const node = create((n) => [n], [99], {immediate: true})
			expect(node.inputs[0]).toBe(99);
			expect(node.outputs[0]).toBe(99);
		})
		it('creates a node without immediate invocation', () => {
			const node = create((n) => [n], [99], {outputCount: 1})
			expect(node.inputs[0]).toBe(99);
			expect(node.outputs[0]).toBe(null);
		})
		it('deduces outputs from port options', () => {
			const node = create((n) => [n], [99], {out: [{}]})
			expect(node.inputs[0]).toBe(99);
			expect(node.outputs[0]).toBe(null);
		})
		it('throws if no output count can be determined', () => {
			expect(() => {
				create((n) => [n], [99])
			}).toThrow();
		})

		it('reflects port name, type, and, field', () => {
			const inputPorts = [{name: 'input', type: DT.any, field: true}]
			const outputPorts = [{name: 'output', type: DT.any}]
			const node = create((n) => [n], [0], {
				in: inputPorts,
				out: outputPorts,
			})
			expect(node.meta.in).toMatchObject(inputPorts)
			expect(node.meta.out).toMatchObject(outputPorts)
		})

		// it('initializes an empty of connections for each input', () => {
		// 	const node = rgb([255, 255, 255])
		// 	// expect(node.connections).toMatchObject([undefined, undefined, undefined])
		// })
	})

	describe('set', () => {
		let val = num([0])
		it('sets default number', () => {
			expect(val.inputs[0]).toBe(0)
		})
		it('sets new value by array', () => {
			expect(val.set([1]).inputs[0]).toBe(1)
		})
		it('sets the output asynchronously', async () => {
			val.set([2])
			await firstValueFrom(val.run$)
			expect(val.outputs[0]).toBe(2)
		})
		it('sets new value by object', () => {
			expect(val.set({0: 10}).inputs[0]).toBe(10)
		})
		it('sets new value by function', () => {
			expect(val.set((val: any) => [val * 2]).inputs[0]).toBe(20)
		})
	})

	describe('named set', () => {
		let num = create((n) => [n], [0], {
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
		let color = create(rgbInc, [0, 0, 0], {immediate: true})

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
		let val = num([1])
		let color = rgb([0, 0, 0])

		it('creates a val node with defined output', () => {
			expect(val.inputs).toMatchObject([1])
			expect(val.outputs).toMatchObject([1])
		})

		it('connects two nodes', async () => {
			val.connect(0, color, 0)
			// only depencies are tracked
			// expect(color.connections[0]).not.toBeFalsy()
			// dependants are not tracked
			// expect(val.connections[0]).not.toBeTruthy()
			await firstValueFrom(color.run$)
			expect(val.outputs[0]).toBe(1);
			expect(color.outputs[0]).toMatchObject({r: 1, g: 0, b: 0})
		})
		it('set propagates to connected nodes', async () => {
			val.set([255])
			await firstValueFrom(color.run$)
			expect(val.outputs[0]).toBe(255)
			expect(color.outputs[0]).toMatchObject({r: 255, g: 0, b: 0})
		})
		it('set propagates to all connected nodes', async () => {
			let color2 = rgb()
			val.connect(0, color2, 1)
			await firstValueFrom(color2.run$)
			expect(val.outputs[0]).toBe(255)
			expect(color2.outputs[0]).toMatchObject({r: 0, g: 255, b: 0})
		})
		// it('incoming connections are saved', () => {
		// 	expect(color.connections[0]).toMatchObject({id: val.id, port: 0})
		// })
	})

	// describe('pipe', () => {
		
	// })

	describe('disconnect', () => {
		let val = num([42])
		let add = create((a, b) => [a + b], [1, 2], {immediate: true})

		it('disconnects a node', async () => {
			val.connect(0, add, 0)
			expect(add.inputs[0]).toBe(42)
			await firstValueFrom(add.run$)
			expect(add.outputs[0]).toBe(44) // 42 + 2

			add.disconnect(0)
			await firstValueFrom(add.run$)
			expect(add.outputs[0]).toBe(3) // 1 + 2
		})

		it('disconnected nodes are not invoked', async () => {
			val.set([42])
			await firstValueFrom(val.run$)
			expect(add.outputs[0]).toBe(3) // disconnected
		})
	})
})
