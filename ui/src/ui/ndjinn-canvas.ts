import {children, define, html, Hybrids} from 'hybrids'
import styles from './ndjinn-canvas.css'
import {drawGraph, drawBox} from './canvas-draw'
import Hotkeys from './factories/Hotkeys'
import store, {selectNodes} from '../store/store'

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
	mouseIO: any,
	[key: string]: any,
}

function onmousedown(host, e) {
	host.mouseIO.onmousedown(e)
}

function onmousemove(host, e) {
	host.mouseIO.onmousemove(e)
}

function onmouseup(host, e) {
	host.mouseIO.onmouseup(e)
}

const NdjinnCanvas: Hybrids<NdjinnCanvas> = {
	hotkeys: Hotkeys<NdjinnCanvas>(BINDINGS),
	nodeElements: children((hy) => hy.hasOwnProperty('fields')),
	onMouseSelect: ({nodeElements}) => ([x1, y1, x2, y2]) => {
		let l = Math.min(x1, x2)
		let t = Math.min(y1, y2)
		let r = Math.max(x1, x2)
		let b = Math.max(y1, y2)
		const ids = nodeElements.filter((el) => {
			const {left, top, width, height} = el.getBoundingClientRect()
			return left >= l && top >= t && left + width <= r && top + height <= b
		}).map((el) => el.id)
		ids.length && store.dispatch(selectNodes(ids))
	},
	mouseIO: ({onMouseSelect}) => {
		let down = false
		let dragging = false
		let selection: [number, number, number, number] = [null, null, null, null]

		function onmousedown(e: MouseEvent) {
			selection = [e.clientX, e.clientY, null, null]
			down = true
		}

		function onmousemove(e: MouseEvent) {
			if(down) {
				dragging = true
				selection[2] = e.clientX
				selection[3] = e.clientY
			}
		}

		function onmouseup(e: MouseEvent) {
			dragging && onMouseSelect(selection)
			selection = [null, null, null, null]
			down = false
			dragging = false
		}

		return {
			onmousedown,
			onmousemove,
			onmouseup,
			selection: (): [number, number, number, number] => selection,
		}
	},
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
		drawBox(host, ...host.mouseIO.selection())
		drawGraph(host)
	},
	render: () => html`
		<canvas></canvas>
		<div tabindex="0" class="nodes"
			onmousedown="${onmousedown}"
			onmousemove="${onmousemove}"
			onmouseup="${onmouseup}">
			<slot></slot>
		</div>
	`.style(styles),
}

define('ndjinn-canvas', NdjinnCanvas)
export default NdjinnCanvas
