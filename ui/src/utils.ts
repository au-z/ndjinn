export function debounce(fn, ms) {
	let timeout
	return (...args) => {
		clearTimeout(timeout)
		timeout = setTimeout(() => fn(...args), ms)
	}
}

export const kebab = (str: string): string => str.replace(/([A-Z])/g, '-$1').replace(/^-/, '');