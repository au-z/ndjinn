import { dispatch } from 'hybrids'
import Mousetrap from 'mousetrap'

export default function Hotkeys<T extends HTMLElement>(bindings: Record<string, (host: T, e: KeyboardEvent) => void>): Descriptor<T> {
	return {
		connect: (host, key, invalidate) => {
			console.log(host, key)
			Object.entries(bindings).forEach(([key, fn]) => {
				Mousetrap.bind(key, (e) => {
					const event = `hotkey:${e.ctrlKey ? 'Ctrl+' : ''}${e.altKey ? 'Alt+' : ''}${e.shiftKey ? 'Shift+' : ''}${e.key}`
					dispatch(host, event, {detail: e, bubbles: true})
					fn(host, e)
				})
			})
		},
	}
}