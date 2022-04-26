import { State } from "./store";

export const selectDatatype = (state: State, datatype: string) => {
	const dt = state.config.datatypes[datatype]
	const parent = dt.parent ? state.config.datatypes[dt.parent] : {}
	return {...parent, ...dt}
}

export const datatypeLineage = (state: State, type: string) => {
	const lineage = [{type, ...(state.config.datatypes[type] || {})}]
	while(lineage[lineage.length - 1]?.parent) {
		const parentType = lineage[lineage.length - 1].parent
		lineage.push({type: parentType, ...(state.config.datatypes[parentType] || {})})
	}
	return lineage
}
