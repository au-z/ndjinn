import { NodeEdge } from '@ndjinn/core'
import { define, html } from 'hybrids'
import { getset } from '../../utils/hybrids.js'
import styles from './node-port.css?inline'

export interface NodePort extends HTMLElement {
  type: string
  types: string[]
  input: boolean
  connected: boolean
  edge: NodeEdge // only the incoming edge
  connectedType: string
  displayType: string
  disabled: boolean
  classes: string[]
}
type H = NodePort

export const NodePort = define<NodePort>({
  tag: 'node-port',
  type: '',
  types: ({ type }: H) => type.split(','),
  connected: false,
  edge: getset({}),
  connectedType: ({ connected, edge }: H) => connected && edge?.type,
  displayType: ({ connectedType, types }: H) => connectedType || types?.[0] || 'any',

  // inputType: {get: (_, val) => val, set: (_, val) => val},
  input: false,
  disabled: false,
  classes: ({ input, connected, disabled, displayType }) => {
    let classes = ['port', displayType]
    if (input) classes.push('input')
    if (connected) classes.push('connected')
    if (disabled) classes.push('disabled')
    return classes
  },
  render: ({ classes, displayType }: H) =>
    html`<div class="${classes}">
      <cam-icon>highlight_off</cam-icon>
    </div>`.css`
		div.port.${displayType} {
			background: var(--ndjinn-dt-${displayType}, #aaa);
		}
	`.style(styles),
})
