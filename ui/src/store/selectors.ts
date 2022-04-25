import { NdjinnState } from "./store";

export const selectDatatype = (state: NdjinnState, datatype: string) => {
	const dt = state.config.datatypes[datatype]
	const parent = dt.parent ? state.config.datatypes[dt.parent] : {}
	return {...parent, ...dt}
}
