import { Node } from '@ndjinn/core'
import { NodeElement } from '../node/base/node-base.js'
import { NodePort } from '../node/base/node-port.js'
import { fill, stroke } from '../utils/canvas.js'

const BOX_STYLE = {
  strokeStyle: '#89abff',
  fillStyle: '#89abff22',
}
const DEBUG_STYLE = {
  strokeStyle: 'white',
}

const PORT_STYLE = {
  strokeStyle: '#8c909b',
  lineWidth: 2,
}

export function drawBox({ ctx }, x1, y1, x2, y2) {
  if (x1 == null || x2 == null || y1 == null || y2 == null) return
  stroke((ctx) => {
    ctx.rect(x1, y1, x2 - x1, y2 - y1)
    ctx.fillRect(x1, y1, x2 - x1, y2 - y1)
  }, BOX_STYLE)(ctx)
}

export function drawGraph({ debug, nodeElements, ctx, nodes }) {
  nodes.forEach((n) => {
    let el = nodeElements.find((el) => el.id === n.id)
    el && drawNode(ctx, n, el, debug)
  })
}

const PORT_DRAW_RAD = 12
const portMap = new Map<string, { x: number; y: number }>()

function drawNode(ctx, node: Node, el: NodeElement, debug = false) {
  const rect = el.shadowRoot
    ? el.shadowRoot.querySelector('.node')?.getBoundingClientRect()
    : el.getBoundingClientRect()
  if (!rect) {
    console.log(el)
  }
  const { left, top, width, height } = rect
  const selected = el.selected

  debug && stroke((ctx) => ctx.rect(left, top, width, height), DEBUG_STYLE)(ctx)

  if (!el.shadowRoot) return
  const portRegions: HTMLElement[] = Array.from(el.shadowRoot.querySelectorAll('node-ports'))
  portRegions.forEach((region) => {
    region.shadowRoot
      ?.querySelectorAll('node-port')
      ?.forEach((p: NodePort) => drawPort(ctx, p, { debug, selected, nodeId: node.id }))
  })
}

function drawPort(ctx, portEl: NodePort, { debug, selected, nodeId }) {
  const { left, top, width, height } = portEl.getBoundingClientRect()
  const pos = {
    x: left + width,
    y: top + height / 2,
  }

  portMap.set(`${nodeId}:${portEl.dataset.id}`, pos)

  debug && stroke((ctx) => ctx.arc(pos.x, pos.y, PORT_DRAW_RAD, 0, Math.PI * 2), DEBUG_STYLE)(ctx)

  const easeControls = (from, to): [number, number][] => [
    [from.x + 0.5 * (to.x - from.x), from.y],
    [from.x + 0.5 * (to.x - from.x), to.y],
  ]

  if (portEl.input && portEl.connected) {
    const to = portMap.get(`${portEl.edge?.id}:${portEl.edge?.port}`)
    if (!to) return // OK: portMap entry may not exist in this render frame yet

    const ctrls = easeControls(pos, to)
    stroke((ctx) => {
      ctx.moveTo(pos.x, pos.y)
      ctx.bezierCurveTo(...ctrls[0], ...ctrls[1], to.x, to.y)
    }, PORT_STYLE)(ctx)

    debug &&
      fill((ctx) => {
        ctx.arc(pos.x, pos.y, 4, 0, 2 * Math.PI)
        ctx.arc(to.x, to.y, 4, 0, 2 * Math.PI)
      }, {})(ctx)
  }
}
