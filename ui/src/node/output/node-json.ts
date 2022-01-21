import CodeTex from 'code-tex'
import { DT } from "@ndjinn/core"
import { html } from "hybrids"
import {NodeComponent} from '../base/node-base'
const components = {CodeTex}

const fn = (obj) => [JSON.stringify(obj, null, 2)]

export const NodePrint = NodeComponent(fn, [{}], {
	in: [{type: DT.any, name: 'json'}],
	out: [],
	component: {
		render: ({inputs}) => html`<div class="json" style="min-width: 240px;">
			<code-tex lang="json" theme="nord"
				source="${JSON.stringify(inputs[0].value)}"
				transparent>
			</code-tex>
		</div>`
	},
})

