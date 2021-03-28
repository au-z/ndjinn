import {define, html} from 'hybrids'
import styles from './ndjinn-toolbar.css'

const NdjinnToolbar = {
	
	render: () => html`<header class="ndjinn-toolbar">
		Hello
	</header>`.style(styles),
}

define('ndjinn-toolbar', NdjinnToolbar)
export default NdjinnToolbar