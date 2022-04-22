import {html, parent, define, dispatch} from 'hybrids'
import NdjinnEditor from './ndjinn-editor'
import {Draggable, CamIcon} from '@auzmartist/cam-el'
import styles from './menu-mouse.css'
import { getset } from '../utils/hybrids'
const components = {CamIcon}

function onclick(tag, host, e) {
	dispatch(host, 'select', {detail: tag, bubbles: true})
}

export default define<any>({
	tag: 'menu-mouse',
	parent: parent(NdjinnEditor),
	x: 0,
	y: 0,
	absPos: ({x, y}) => ({left: `${x}px`, top: `${y}px`}),
	...Draggable({absolutePositioning: true}),
	mousePos: ({parent}) => () => parent.mousePos,
	catalog: getset([]),
	keys: 'x',
	render: ({catalog, absPos}) => html`
	<nav class="menu" style="${absPos}">
		<cam-box class="header" flex="space-between center">
			<span>&nbsp;Create&nbsp;&nbsp;</span>
			<cam-icon title="close" onclick="${(host, e) => onclick(null, host, e)}">close</cam-icon>
		</cam-box>
		<div class="content">
			<ul>${catalog.map((cat) => html`
				<li>
					<small>${cat.name}<cam-icon>chevron_right</cam-icon></small>
					<div class="nodes">${cat.nodes.map((n) => html`
						<button onclick="${(host, e) => onclick(n, host, e)}">
							<cam-icon>${n.icon || 'web_asset'}</cam-icon>
							&nbsp;${n.name}
						</button>`)}
					</div>
				</li>
			`)}</ul>
		</div>
	</nav>`.style(styles),
})
