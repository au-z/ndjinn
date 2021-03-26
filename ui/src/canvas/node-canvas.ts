import {children, define, html, Hybrids, parent} from 'hybrids'
import { Node } from '@ndjinn/core'
import NodeEditor from '../node-editor'
import { NodeElement } from '../node/node-base'
import styles from './node-canvas.css'

interface Element extends HTMLElement {
	[key: string]: any
}

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
		const inputMargin = region.hasAttribute('left') ? INPUT_MARGIN : 0
		region.shadowRoot?.querySelectorAll('node-port')
			?.forEach((p) => drawPort(ctx, p, {debug, inputMargin, nodeId: node.id}))
	})
}

function drawPort(ctx, el, {debug, inputMargin, nodeId}) {
	const {left, top, width, height} = el.getBoundingClientRect()
	const pos = {
		x: (left + width) + inputMargin,
		y: (top + height / 2),
	}
	
	portMap.set(`${nodeId}:${el.id}`, pos)
	
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

	if(el.input && el.connected) {
		ctx.beginPath()
		el.edges.forEach((e) => {
			const to = portMap.get(`${e.id}:${e.idx}`)
			if(!to) {
				throw new Error('Cannot connect to missing node')
			}
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

export interface NodeCanvas extends HTMLElement {
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

const NodeCanvas: Hybrids<NodeCanvas> = {
	nodeElements: children((hy) => hy.hasOwnProperty('fields')),
	nodes: [],
	debug: false,
	throttle: 0,
	canvas: {
		get: ({debug, render}) => render().querySelector('canvas'),
		connect: (host, key, invalidate) => {
			host.resize(host.clientWidth, host.clientHeight)
			console.log(host)
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

define('node-canvas', NodeCanvas)
export default NodeCanvas
