import { html } from 'hybrids'
import { Ndjinn } from '../base/node-base.js'

export const RGB = Ndjinn.component((r, g, b) => [{ r, g, b }], [0, 0, 0], {
  in: [
    { type: 'uint8', name: 'r', field: true },
    { type: 'uint8', name: 'g', field: true },
    { type: 'uint8', name: 'b', field: true },
    // {type: 'uint8', name: 'a', field: true, }, // options: {clamp: [0, 1]}
  ],
  out: [{ type: 'rgb', name: 'color' }],
})

export const HSL = Ndjinn.component(
  (h, s, l) => [{ h, s, l }],
  [0, 1, 0.5],
  {
    in: [
      { type: 'deg', name: 'hue', field: true },
      { type: 'percent', name: 'sat', field: true },
      { type: 'percent', name: 'lum', field: true },
    ],
    out: [{ type: 'hsl', name: 'color' }],
  },
  { debug: true }
)

function swatch(rgba) {
  return [{ r: rgba.r, g: rgba.g, b: rgba.b, a: rgba.a ?? 1 }]
}

export const Swatch = Ndjinn.component(swatch, [{ r: 0, g: 0, b: 0, a: 1 }], {
  in: [{ type: 'rgba', name: 'color' }],
  out: [{ type: 'rgba', name: 'color' }],
  component: {
    render: ({ node }) => html`<cam-swatch
      r="${node.outputs[0].r}"
      g="${node.outputs[0].g}"
      b="${node.outputs[0].b}"
      a="${node.outputs[0].a}"
    ></cam-swatch>`.css`
			cam-swatch::part(swatch) {
				padding: 0 0.5rem;g
			}
		`,
  },
})
