import {children, define, Descriptor, dispatch, html, Hybrids} from 'hybrids'
import styles from './ndjinn-canvas.css'
import {drawGraph} from './canvas-draw'
import Hotkeys from './factories/Hotkeys'

const BINDINGS = {
	'x': () => {},
	'a': () => {},
	'Shift+D': () => {},
}

export interface NdjinnCanvas extends HTMLElement {
	hotkeys: any,
	nodeElements: any,
	nodes: any[],
	debug: boolean,
	throttle: number,
	canvas: HTMLCanvasElement,
	ctx: CanvasRenderingContext2D,
	wipe: Function,
	resize: Function,
	draw: Function,
	render: Function,
}

const NdjinnCanvas: Hybrids<NdjinnCanvas> = {
	hotkeys: Hotkeys<NdjinnCanvas>(BINDINGS),
	nodeElements: children((hy) => hy.hasOwnProperty('fields')),
	nodes: [],
	debug: false,
	throttle: 0,
	canvas: {
		get: ({debug, render}) => render().querySelector('canvas'),
		connect: (host, key, invalidate) => {
			host.resize(host.clientWidth, host.clientHeight)
			host.draw(host, host.debug && 300)
		},
		observe: (host, canvas) => {
			if(!canvas) return
			window.addEventListener('resize', () => {
				host.resize(host.clientWidth, host.clientHeight)
			})
		},
	},
	resize: ({canvas}) => (width, height) => {
		canvas.width = width
		canvas.height = height
	},
	ctx: ({canvas}) => canvas.getContext('2d'),
	wipe: ({canvas, ctx}) => () => ctx.clearRect(0, 0, canvas.width, canvas.height),
	draw: (host) => () => {
		if(host.throttle != null)  {
			setTimeout(host.draw, host.throttle)
		} else {
			requestAnimationFrame(() => host.draw())
		}
		host.wipe()
		drawGraph(host)
	},
	render: () => html`
		<canvas></canvas>
		<div tabindex="0" class="nodes">
			<slot></slot>
		</div>
	`.style(styles),
}

define('ndjinn-canvas', NdjinnCanvas)
export default NdjinnCanvas
