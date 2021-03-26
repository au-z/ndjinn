import { define, dispatch, html, Hybrids, parent, property } from 'hybrids'
import * as CamEl from '@auzmartist/cam-el'
import NodeEditor from './node-editor'
import MenuMouse from './ui/menu-mouse'
import NodeCanvas from './canvas/node-canvas'
import NodeNumber from './node/node-number'
import NodeHsl from './node/node-hsl'
import NodeSwatch from './node/node-swatch'

import Mousetrap from 'mousetrap'

let components = {
	...CamEl,
	NodeEditor,
	MenuMouse,
	NodeCanvas,
	NodeNumber,
	NodeHsl,
	NodeSwatch,
}

define('cam-hotkey-toggle', {
	keys: 'x',
	on: false,
	parent: parent(NodeEditor),
	value: {
		get: (host, val = host.on) => val,
		set: (host, val) => val,
		connect: (host, key) => {
			Mousetrap(host.parent).bind(host.keys, (e) => {
				dispatch(host, 'change', {detail: !host[key], bubbles: true})
				host[key] = !host[key]
			})
		},
	},
	render: ({value}) => html`<div tabindex="0">
		${value ? html`<slot name="on"></slot>` : html`<slot name="off"></slot>`}
	</div>`
} as Hybrids<any>)
