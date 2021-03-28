import {children, define, html, Hybrids} from 'hybrids'
import { Node, Port } from '@ndjinn/core'
import { NodeElement } from '../node/base/node-base'
import styles from './ndjinn-canvas.css'
import {NodePort} from '../node/base/node-port'

function drawGraph({debug, nodeElements, ctx, nodes}) {
	nodes.forEach((n) => {
		let el = nodeElements.find((el) => el.id === n.id)
		drawNode(ctx, n, el, debug)
	})
}

const PORT_DRAW_RAD = 12
const portMap = new Map<string, {x: number, y: number}>()

function drawNode(ctx, node: Node, el: NodeElement, debug = false) {
	const {left, top, width, height} = el.getBoundingClientRect()
	const selected = el.selected

	if(debug) {
		ctx.beginPath()
		ctx.strokeStyle = 'white'
		ctx.rect(left, top, width, height)
		ctx.stroke()
	}

	if(!el.shadowRoot) return
	const portRegions: HTMLElement[] = Array.from(el.shadowRoot.querySelectorAll('node-ports'))
	portRegions.forEach((region) => {
		region.shadowRoot?.querySelectorAll('node-port')
			?.forEach((p: NodePort) => drawPort(ctx, p, {debug, selected, nodeId: node.id}))
	})
}

function drawPort(ctx, portEl: NodePort, {debug, selected, nodeId}) {
	const {left, top, width, height} = portEl.getBoundingClientRect()
	const pos = {
		x: (left + width),
		y: (top + height / 2),
	}
	
	portMap.set(`${nodeId}:${portEl.id}`, pos)
	
	if(debug) {
		ctx.beginPath()
		ctx.strokeStyle = 'white'
		ctx.arc(pos.x, pos.y, PORT_DRAW_RAD, 0, Math.PI * 2)
		ctx.stroke()
	}
	
	const easeControls = (from, to) => [
		[from.x + 0.5 * (to.x - from.x), from.y],
		[from.x + 0.5 * (to.x - from.x), to.y],
	]

	if(portEl.input && portEl.connected) {
		portEl.edges.forEach((e: Port) => {
			const to = portMap.get(`${e.id}:${e.port}`)
			if(!to) return // OK: portMap entry may not exist in this render frame yet

			const ctrls = easeControls(pos, to)
			ctx.beginPath()
			ctx.lineWidth = 2
			ctx.strokeStyle = selected ? linearGradient(ctx, pos, to, '#8c909b', '#f3cd95') : '#8c909b'
			ctx.moveTo(pos.x, pos.y)
			ctx.bezierCurveTo(...ctrls[0], ...ctrls[1], to.x, to.y)
			ctx.stroke()

			if(debug) {
				ctx.beginPath()
				ctx.arc(pos.x, pos.y, 4, 0, 2 * Math.PI)
				ctx.arc(to.x, to.y, 4, 0, 2 * Math.PI)
				ctx.fill()
			}
		})
	}
}

function linearGradient(ctx, from, to, cFrom, cTo) {
	const grad = ctx.createLinearGradient(from.x, from.y, to.x, to.y)
	grad.addColorStop("0", cTo)
	grad.addColorStop("1.0", cFrom)
	return grad
}

export interface NdjinnCanvas extends HTMLElement {
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
	render: ({nodes}) => html`
		<canvas></canvas>
		<div class="nodes">
			<slot></slot>
		</div>
	`.style(styles),
}

define('ndjinn-canvas', NdjinnCanvas)
export default NdjinnCanvas
