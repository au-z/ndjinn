import { DT } from "@ndjinn/core"
import { define, html } from "hybrids"
import {NodeUI} from '../base/node-base'

const fn = ({r, g, b, h, s, l, a}: any) => {
	if([r, g, b].every((c) => c != null)) return [{r, g, b, a: a != null ? a : 1}]
	if([h, s, l].every((c) => c != null)) return [{h, s, l, a: a != null ? a : 1}]
	else return [null]
}

const NodeSwatch = NodeUI(fn, [{h: 0, s: 0, l: 0}], {
	'^(any|vec3).*': {fn: ([r, g, b]) => fn({
		r: Math.max(0, Math.min(255, r)),
		g: Math.max(0, Math.min(255, g)),
		b: Math.max(0, Math.min(255, b)),
	})},
}, {
	name: 'swatch',
	tag: 'node-swatch',
	in: [{type: [DT.rgb, DT.hsl, DT.rgba, DT.hsla], name: 'color'}],
	out: [],
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
})

define('node-swatch', NodeSwatch)
export default NodeSwatch