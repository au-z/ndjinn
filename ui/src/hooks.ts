export const useMouse = {
	mousePos: {
		connect: (host, key) => {
			host[key] = {x: 0, y: 0}
			document.addEventListener('mousemove', (e) => {
				host[key] = {x: e.clientX, y: e.clientY}
			})
		},
	},
}