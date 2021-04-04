import { DT } from "@ndjinn/core"
import { define, html } from "hybrids"
import {NodeUI} from '../base/node-base'

const fn = (obj) => [JSON.stringify(obj, null, 2)]

const NodeJSON = NodeUI(fn, [{}], {
	name: 'json',
	in: [{type: [DT.obj], name: 'json'}],
	out: [{type: [DT.str], name: 'formatted'}],
	render: ({outputs}) => html`<div class="json">
		<code-tex lang="json" theme="nord" source="${outputs[0].value}"></code-tex>
	</div>
	<style>
		.json {
			min-width: 200px;
		}
	</style>`,
})

define('node-json', NodeJSON)
export default NodeJSON