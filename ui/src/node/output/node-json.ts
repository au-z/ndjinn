import CodeTex from 'code-tex'
import { DT } from "@ndjinn/core"
import { html } from "hybrids"
import {Ndjinn} from '../base/node-base'
const components = {CodeTex}

const print = (obj) => [JSON.stringify(obj, null, 2)]

export const NodePrint = Ndjinn.component(print, [{}], {
	in: [{type: DT.any, name: 'json'}],
	immediate: true,
	component: {
		render: ({node}) => html`<div class="json" style="min-width: 240px;">
			<code-tex lang="json" theme="nord"
				source="${node.outputs[0]}"
				transparent>
			</code-tex>
		</div>`
	},
})
