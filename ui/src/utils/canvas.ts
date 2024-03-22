export type Ctx = CanvasRenderingContext2D
export type CtxStyle = Partial<Ctx>

export const stroke = (fn: (ctx: Ctx) => void, style: CtxStyle) => (ctx: Ctx) => {
  ctx.beginPath()
  Object.entries(style).forEach(([k, v]) => (ctx[k] = v))
  fn(ctx)
  ctx.stroke()
}

export const fill = (fn: (ctx: Ctx) => void, style: CtxStyle) => (ctx: Ctx) => {
  ctx.beginPath()
  Object.entries(style).forEach(([k, v]) => (ctx[k] = v))
  fn(ctx)
  ctx.fill()
}

export function linearGradient(ctx, from, to, cFrom, cTo) {
  const grad = ctx.createLinearGradient(from.x, from.y, to.x, to.y)
  grad.addColorStop('0', cTo)
  grad.addColorStop('1.0', cFrom)
  return grad
}
