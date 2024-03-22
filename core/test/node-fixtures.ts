import { create } from '../src/Node.js'

export function num(defaults = [0]) {
  return create((x) => [x], defaults, {
    in: [{ type: 'num', name: 'num' }],
    out: [{ type: 'num', name: 'num' }],
  })
}

export function rgb(defaults = [0, 0, 0]) {
  return create((r, g, b) => [{ r, g, b }], defaults, {
    in: [
      { type: 'num', name: 'r' },
      { type: 'num', name: 'g' },
      { type: 'num', name: 'b' },
    ],
    out: [{ type: 'rgb', name: 'rgb' }],
  })
}
