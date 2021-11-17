import {define, html} from 'hybrids'
import store from '../store/store'
import {serializeNodeGraph} from '../store/localStorage'

import styles from './ndjinn-toolbar.css'

function exportState(host) {
	var json = JSON.stringify(serializeNodeGraph(store.getState()))
	const file = new Blob([json], {type: 'application/json'})
	var a = document.createElement("a"),
	url = URL.createObjectURL(file)
	a.href = url
	a.download = `${host.projectFileName}.ndjinn.json`
	document.body.appendChild(a)
	a.click()
	setTimeout(() => {
		document.body.removeChild(a)
		window.URL.revokeObjectURL(url)  
	}, 0)
}

function importState(host, e) {
	
}

const NdjinnToolbar = {
	projectName: 'project-001',
	projectFileName: ({projectName}) => projectName.toLowerCase().replace(/\s+/gim, '_'),
	render: ({projectName}) => html`<header class="ndjinn-toolbar">
		<div class="tools">
			<cam-input value="${projectName}"
				onupdate="${(host, {detail}) => host.projectName = detail}"></cam-input>
			<button onclick="${exportState}"><cam-icon>file_download</cam-icon></button>
			<button onclick="${importState}"><cam-icon>file_upload</cam-icon></button>
		</div>
	</header>`.style(styles),
}

define('ndjinn-toolbar', <any>NdjinnToolbar)
export default NdjinnToolbar