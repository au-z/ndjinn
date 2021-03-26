import {html, property, parent, define, Hybrids, dispatch} from 'hybrids'
import NodeEditor from '../node-editor'
import {Draggable} from '@auzmartist/cam-el'
import styles from './menu-mouse.css'

function onclick(tag, host, e) {
	dispatch(host, 'select', {detail: tag, bubbles: true})
}

const MenuMouse: Hybrids<any> = {
	parent: parent(NodeEditor),
	x: 0,
	y: 0,
	absPos: ({x, y}) => ({left: `${x}px`, top: `${y}px`}),
	...Draggable({absolutePositioning: true}),
	mousePos: ({parent}) => () => parent.mousePos,
	catalog: property([]),
	keys: 'x',
	render: ({catalog, absPos}) => html`
	<nav class="menu" style="${absPos}">
		<div class="header">Add</div>
		<div class="content">
			<ul>${catalog.map((cat) => html`
				<li>
					${cat.name}
					<div class="nodes">${cat.nodes.map((n) => html`
						<button onclick="${(host, e) => onclick(n, host, e)}">
							<cam-icon>${n.icon || 'web_asset'}</cam-icon>
							<label>&nbsp;${n.name}</label>
						</button>`)}
					</div>
				</li>
			`)}</ul>
		</div>
	</nav>`.style(styles),
}

define('menu-mouse', MenuMouse)
export default MenuMouse
