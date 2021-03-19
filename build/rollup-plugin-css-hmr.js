import path from 'path'

/**
 * Triggers a page reload when a matching CSS filename is changed
 * @param {Function} ext an extension to hot reload if its matching css changes
 */
export default function CssHmr(ext) {
	const matchFn = (id) => path.basename(id)?.indexOf(ext) > -1

	return {
		name: 'css-hmr',
		handleHotUpdate({file, modules, server}) {
			const ext = path.win32.extname(file)
			const name = path.win32.basename(file, ext)
			if(ext === '.css') {
				server.ws.send({type: 'custom', event: name, data: {}})
			}
		},
		transform(src, id) {
			if(!matchFn(id)) return

			const ext = path.win32.extname(id)
			const name = path.win32.basename(id, ext)
			return {
				code: src + `\n\n
					// -----
					//  HMR
					// -----
					if(import.meta.hot) {
						import.meta.hot.on('${name}', () => {
							import.meta.hot.invalidate();
						})
					}
				`,
				map: null,
			}
		}
	}
}
