export const Arr = {
	range: (x) => [...Array(x).keys()],
}

export const setEffect = (fn) => ({
	set: (inputs, key, value) => {
		try {
			inputs[key] = value
		} catch {
			return false
		} finally {
			fn(value)
			return true
		}
	},
})
