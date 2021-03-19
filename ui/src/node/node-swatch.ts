import { create, DT } from "@ndjinn/core";
import { define, html } from "hybrids";
import {Node} from './node-base'

const node = create((hsl) => [], [{h: 0, s: 0, l: 0}], {
	in: [{type: DT.hsl, name: 'hsl'}],
})

const NodeSwatch = Node(node, {
	name: 'swatch',
	fields: [],
	render: ({inputs}) => html`<cam-swatch
		h="${inputs[0].value.h}"
		s="${inputs[0].value.s * 100}"
		l="${inputs[0].value.l * 100}"
	></cam-swatch>`
})

define('node-swatch', NodeSwatch)
export default NodeSwatch