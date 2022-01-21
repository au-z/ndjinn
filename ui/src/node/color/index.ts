import { DT } from "@ndjinn/core";
import { html } from "hybrids";
import { NodeComponent } from "../base/node-base";

export const RGB = NodeComponent((r, g, b) => [{r, g, b}], [0, 0, 0], {
	in: [
		{type: DT.uint8, name: 'r', field: true},
		{type: DT.uint8, name: 'g', field: true},
		{type: DT.uint8, name: 'b', field: true},
	],
	out: [
		{type: DT.rgb, name: 'color'},
	],
})

export const HSL = NodeComponent((h, s, l) => [{h, s, l}], [0, 1, 0.5], {
	in: [
		{type: DT.deg, name: 'hue', field: true},
		{type: DT.percent, name: 'sat', field: true},
		{type: DT.percent, name: 'lum', field: true},
	],
	out: [
		{type: DT.hsl, name: 'color'},
	],
})

function swatch({r, g, b, h, s, l, a}: any) {
	if([r, g, b].every((c) => c != null)) return [{r, g, b, a: a != null ? a : 1}]
	if([h, s, l].every((c) => c != null)) return [{h, s, l, a: a != null ? a : 1}]
	else return [null]
}

export const Swatch = NodeComponent(swatch, [{h: 0, s: 0, l: 0}], {
	in: [
		{type: [DT.rgb, DT.hsl, DT.rgba, DT.hsla], name: 'color'}
	],
	out: [],
	variants: {
		'^(any|vec3).*': {fn: ([r, g, b]) => swatch({
			r: Math.max(0, Math.min(255, r)),
			g: Math.max(0, Math.min(255, g)),
			b: Math.max(0, Math.min(255, b)),
		})}
	},
	component: {
		render: ({outputs}) => html`<cam-swatch
			r="${outputs[0].value.r}" g="${outputs[0].value.g}" b="${outputs[0].value.b}"
			h="${outputs[0].value.h}" s="${outputs[0].value.s * 100}" l="${outputs[0].value.l * 100}"
			a="${outputs[0].value.a}"
		></cam-swatch>
		<style>
			cam-swatch::part(swatch) {
				padding: 0 0.5rem;
			}
		</style>`
	}
})

