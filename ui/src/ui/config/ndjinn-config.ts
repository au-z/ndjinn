import {Component, define, dispatch} from 'hybrids'
import { DatatypeMap } from '../../store/store'
import { getset } from '../../utils/hybrids'

const EVENT_SET_DATATYPES = 'set:datatypes'

export const NdjinnConfig = define<any>({
	tag: 'ndjinn-config',
	datatypes: {
		get: (host, val) => val,
		set: (host, val) => val,
		connect: (host, key) => {
			const parser = new DOMParser()
			const doc = parser.parseFromString(host.innerHTML, 'application/xml')
			host[key] = buildDatatypes(doc)
		},
		observe: (host, datatypes) => {
			datatypes && dispatch(host, EVENT_SET_DATATYPES, {detail: datatypes, bubbles: true})
		},
	},
})

function buildDatatypes(doc: Document) {
	let datatypes: DatatypeMap = {}

	doc.childNodes.forEach((c: ChildNode) => {
		parseNode(c as Element);
	})

	function parseNode(el: Element, parent?: string) {
		const datatype = el.tagName.replace(`dt-`, '')
		datatypes[datatype] = {
			parent,
			color: el.getAttribute('color')?.replace(/^0x/, '#') ?? 'initial',
			min: parseFloat(el.getAttribute('min')),
			max: parseFloat(el.getAttribute('max')),
			step: parseFloat(el.getAttribute('step')),
		}

		if(el.children) {
			Array.from(el.children).forEach((child) => parseNode(child, datatype))
		}
	}

	return datatypes
}

export function useNdjinnConfig<E>(onset: (host: Component<E>, datatypes: DatatypeMap) => void) {

	function setDatatypeStyles(host: HTMLElement, datatypes: DatatypeMap) {
		Object.entries(datatypes).forEach(([datatype, {color}]) => {
			color && host.style.setProperty(`--ndjinn-dt-${datatype}`, color)
		})
	}

	return {
		_listenSetDatatypes: {...getset(''), connect: (host, key) => {
			host.addEventListener(EVENT_SET_DATATYPES, ({detail}) => {
				setDatatypeStyles(host, detail);
				onset(host, detail);
			})
		}}
	}
}
