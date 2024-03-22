import { beforeAll, describe, it, expect } from 'vitest'
import { Ndjinn } from '../src/node/base/node-base.js'
import { test } from './helpers.js'

describe('Ndjinn UI', () => {
  describe('component API', () => {
    beforeAll(() => {
      const number = (n) => [n]
      const nodeNumber = Ndjinn.component(number, [0]).define()

      const nodeNumberEdit = Ndjinn.component(number, [0], {
        in: [{ field: true }],
      }).define('node-number-edit')
    })

    it(
      'creates an Ndjinn node',
      test(`
      <node-number></node-number>
    `)((el) => {
        expectCustomElement(el, 'node-number')

        expect(el.name).toBe('number')
        expect(el.selected).toBe(false)
        expect(el.incoming).toMatchObject([])
        expect(el.inputs).toMatchObject([{ mode: 'EDIT', value: 0 }])
        expect(el.outputs).toMatchObject([0])
        expect(el.fields).toMatchObject([])

        // Node
        expect(el.node.inputs).toMatchObject([0])
        expect(el.node.outputs).toMatchObject([0])
        expect(el.node.connections).toMatchObject([undefined])
        expect(el.node.meta).toMatchObject({ in: [{ value: 0 }], out: [{ value: 0 }] })
      })
    )

    it.only(
      'create a Ndjinn node with fields',
      test(`
      <node-number-edit></node-number-edit>
    `)((el) => {
        expectCustomElement(el, 'node-number-edit')

        expect(el.name).toMatchObject('number-edit')
        expect(el.inputs).toMatchObject([{ mode: 'EDIT', value: 0 }])
        expect(el.fields.length).toBe(1)
      })
    )
  })
})

function expectCustomElement(el, name: string) {
  expect(el.tagName).toBe(name.toUpperCase())
  expect(el.constructor.name).toBe('HybridsElement')
}
