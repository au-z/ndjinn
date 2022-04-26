import CodeTex from 'code-tex'
import { html } from "hybrids"
import {Ndjinn} from '../base/node-base'
const components = {CodeTex}

const print = (obj) => [JSON.stringify(obj, null, 2)]

export const NodePrint = Ndjinn.component(print, [{}], {
	in: [{type: 'any', name: 'json'}],
	component: {
		render: ({node}) => html`<div class="json" style="min-width: 240px;">
			<code-tex lang="json" theme="nord"
				source="${node.outputs[0]}"
				transparent>
			</code-tex>
		</div>`
	},
})
