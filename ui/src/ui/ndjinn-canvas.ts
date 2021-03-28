import {children, define, html, Hybrids} from 'hybrids'
import { Node, Port } from '@ndjinn/core'
import { NodeElement } from '../node/base/node-base'
import styles from './ndjinn-canvas.css'
import {NodePort} from '../node/base/node-port'

function drawGraph({debug, nodeElements, ctx, container, nodes}) {
	nodes.forEach((n) => {
		let el = nodeElements.find((el) => el.id === n.id)
		drawNode(ctx, n, el, debug)
	})
}

const PORT_SIZE = 8
const INPUT_MARGIN = -1 * PORT_SIZE
const PORT_DRAW_RAD = 12
const portMap = new Map<string, {x: number, y: number}>()

function drawNode(ctx, node: Node, el: NodeElement, debug = false) {
	const {left, top, width, height} = el.getBoundingClientRect()

	if(debug) {
		ctx.beginPath()
		ctx.strokeStyle = 'white'
		ctx.rect(left, top, width, height)
		ctx.stroke()
	}

	if(!el.shadowRoot) return
	const portRegions: HTMLElement[] = Array.from(el.shadowRoot.querySelectorAll('node-ports'))
	portRegions.forEach((region) => {
		const inputMargin = region.hasAttribute('inputs') ? INPUT_MARGIN : 0
		region.shadowRoot?.querySelectorAll('node-port')
			?.forEach((p: NodePort) => drawPort(ctx, p, {debug, inputMargin, nodeId: node.id}))
	})
}

function drawPort(ctx, portEl: NodePort, {debug, inputMargin, nodeId}) {
	const {left, top, width, height} = portEl.getBoundingClientRect()
	const pos = {
		x: (left + width) + inputMargin,
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
		if(nodeId === '722afe6d-192b-48cd-b7ca-eb1c1966c0b4') {
			
		}
		ctx.beginPath()
		portEl.edges.forEach((e: Port) => {
			const to = portMap.get(`${e.id}:${e.port}`)
			if(!to) return // portMap entry may not exist in this render frame yet

			const ctrls = easeControls(pos, to)
			ctx.beginPath()
			ctx.strokeStyle = '#d7d8da'
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
