import { getset } from './utils/hybrids.js'

export const useMouse = {
  mousePos: {
    ...getset({ x: 0, y: 0 }),
    connect: (host, key) => {
      document.addEventListener('mousemove', (e) => {
        host[key] = { x: e.clientX, y: e.clientY }
      })
    },
  },
}
