import { html } from 'hybrids'
import { rgb_hsl, shiftHue, scale } from '../../math/color.js'
import { Ndjinn } from '../base/node-base.js'

const fn = ({ r, g, b, h, s, l, a }: any, mode, deg): any[] => {
  let hsl
  if ([r, g, b].every((c) => c != null)) hsl = { ...rgb_hsl({ r, g, b }), a: a != null ? a : 1 }
  if ([h, s, l].every((c) => c != null)) hsl = scale({ h, s, l, a: a != null ? a : 1 }, { h: 1 / 360 })

  mode = Math.max(2, mode % 6)
  deg %= 360

  const outputs = [
    scale(hsl, { h: 360 }),
    scale(shiftHue(hsl, deg / 360), { h: 360 }),
    scale(mode < 3 ? hsl : shiftHue(hsl, (2 * deg) / 360), { h: 360 }),
    scale(mode < 4 ? hsl : shiftHue(hsl, (3 * deg) / 360), { h: 360 }),
    scale(mode < 5 ? hsl : shiftHue(hsl, (4 * deg) / 360), { h: 360 }),
  ]
  return outputs
}

export const NodePolyad = Ndjinn.component(
  fn,
  [{ h: 0, s: 0, l: 0 }, 2, 60],
  // {
  // 	'^vec3.*': { fn: ([r, g, b], mode, deg) => fn({ r, g, b }, mode, deg) },
  // 	'.*': { fn },
  // },
  {
    in: [
      { type: 'color', name: 'color' },
      { type: 'num', name: 'mode', field: true },
      { type: 'num', name: 'deg', field: true },
    ],
    out: [
      { type: 'hsl', name: 'A' },
      { type: 'hsl', name: 'B' },
      { type: 'hsl', name: 'C' },
      { type: 'hsl', name: 'D' },
      { type: 'hsl', name: 'E' },
    ],
    component: {
      render: ({ inputs, fields }) => html`<form>
        <div class="field">
          <select value="${fields[0].value}" onchange="${(host, e) => host.set({ mode: parseInt(e.target.value) })}">
            <option value="2">Diad</option>
            <option value="3">Triad</option>
            <option value="4">Tetrad</option>
            <option value="5">Pentad</option>
          </select>
        </div>
        <div class="field">
          <cam-input
            type="number"
            value="${fields[1].value}"
            min="0"
            max="360"
            step="1"
            wrap
            onupdate="${(host, e) => host.set({ deg: parseFloat(e.detail) })}"
            disabled="${fields[1].mode !== 'EDIT'}"
          ></cam-input>
        </div>
      </form>`,
    },
  }
)
