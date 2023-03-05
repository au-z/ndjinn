import { DT } from '@ndjinn/core'
import { define, html } from 'hybrids'
import { Ndjinn, NodeUI } from '../base/node-base'

const bitMash = {
  in: [
    { type: DT.bit, name: 'a' },
    { type: DT.bit, name: 'b' },
  ],
  out: [{ type: DT.bit, name: 'out' }],
  render: ({}) => html`<form></form>`,
}

export const NodeBit = Ndjinn.component((bit) => [bit], [false], {
  in: [{ type: DT.bit, name: 'i', field: true }],
  out: [{ type: DT.bit, name: 'o' }],
  immediate: true,
})

// const NodeBit = NodeUI((bit) => [bit], [false], null, {
//   name: 'BIT',
//   tag: 'node-bit',
//   in: [{ type: DT.bit, name: 'val', field: true }],
//   out: [{ type: DT.bit, name: 'val' }],
//   render: ({ fields: [bit] }) => html`<form>
//     <div class="field">
//       <label>${bit.name}</label>
//       <cam-input
//         type="checkbox"
//         toggle
//         value="${bit.value}"
//         oninput="${(host, e) => host.set({ 0: e.detail })}"
//       ></cam-input>
//     </div>
//   </form>`,
// })

// const NodeNot = NodeUI((a) => [!a], [false], null, {
//   name: 'NOT',
//   tag: 'node-not',
//   in: [{ type: DT.bit, name: 'val' }],
//   out: [{ type: DT.bit, name: 'not' }],
//   render: ({}) => html`<form></form>`,
// })
// define('node-not', NodeNot)

// const NodeAnd = NodeUI((a, b) => [a && b], [false, false], null, {
//   name: 'AND',
//   tag: 'node-and',
//   ...bitMash,
// })
// define('node-and', NodeAnd)

// const NodeNand = NodeUI((a, b) => [!(a && b)], [false, false], null, {
//   name: 'NAND',
//   tag: 'node-nand',
//   ...bitMash,
// })
// define('node-nand', NodeNand)

// const NodeOr = NodeUI((a, b) => [a && b], [false, false], null, {
//   name: 'OR',
//   tag: 'node-or',
//   ...bitMash,
// })
// define('node-or', NodeOr)

// const NodeXor = NodeUI((a, b) => [!a === b], [false, false], null, {
//   name: 'XOR',
//   tag: 'node-xor',
//   ...bitMash,
// })
// define('node-xor', NodeXor)

// export { NodeNot, NodeAnd, NodeNand, NodeOr, NodeXor }
