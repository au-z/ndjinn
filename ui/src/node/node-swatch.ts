import { DT } from "@ndjinn/core";
import { define, html } from "hybrids";
import {NodeUI} from './base/node-base'

const fn = (hsl) => []

const NodeSwatch = NodeUI(fn, [{h: 0, s: 0, l: 0}], {
	name: 'swatch',
	in: [{type: DT.hsl, name: 'hsl'}],
	out: [],
	fields: [],
	render: ({inputs}) => html`<cam-swatch
		h="${inputs[0].value.h}"
		s="${inputs[0].value.s * 100}"
		l="${inputs[0].value.l * 100}"
	></cam-swatch>`
})

define('node-swatch', NodeSwatch)
export default NodeSwatch