import { DT } from '@ndjinn/core'
import { html } from 'hybrids'
import { Ndjinn } from '../base/node-base'
import { CamSwatch } from '@auzmartist/cam-el'
const components = { CamSwatch }

export const RGB = Ndjinn.component((r, g, b) => [{ r, g, b }], [0, 0, 0], {
  in: [
    { type: DT.uint8, name: 'r', field: true },
    { type: DT.uint8, name: 'g', field: true },
    { type: DT.uint8, name: 'b', field: true },
    // {type: DT.uint8, name: 'a', field: true, }, // options: {clamp: [0, 1]}
  ],
  out: [{ type: DT.rgb, name: 'color' }],
  immediate: true,
})

export const HSL = Ndjinn.component(
  (h, s, l) => [{ h, s, l }],
  [0, 1, 0.5],
  {
    in: [
      { type: DT.deg, name: 'hue', field: true },
      { type: DT.percent, name: 'sat', field: true },
      { type: DT.percent, name: 'lum', field: true },
    ],
    out: [{ type: DT.hsl, name: 'color' }],
    immediate: true,
  },
  { debug: true }
)

function swatch(rgba) {
  return [{ r: rgba.r, g: rgba.g, b: rgba.b, a: rgba.a ?? 1 }]
}

export const Swatch = Ndjinn.component(swatch, [{ r: 0, g: 0, b: 0, a: 1 }], {
  in: [{ type: DT.rgba, name: 'color' }],
  out: [{ type: DT.rgba, name: 'color' }],
  immediate: true,
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
