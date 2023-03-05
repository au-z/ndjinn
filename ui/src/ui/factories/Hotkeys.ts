import { Descriptor, dispatch } from 'hybrids'
import Mousetrap from 'mousetrap'
import { getset } from '../../utils/hybrids'

export default function Hotkeys<T extends HTMLElement>(
  bindings: Record<string, (host: T, e: KeyboardEvent) => void>
): Descriptor<T, {}> {
  return {
    ...getset({}),
    connect: (host, key, invalidate) => {
      Object.entries(bindings).forEach(([key, fn]) => {
        Mousetrap.bind(key, (e) => {
          const event = `hotkey:${e.ctrlKey ? 'Ctrl+' : ''}${e.altKey ? 'Alt+' : ''}${e.shiftKey ? 'Shift+' : ''}${
            e.key
          }`
          dispatch(host, event, { detail: e, bubbles: true })
          fn(host, e)
        })
      })
    },
  }
}
