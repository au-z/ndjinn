import { Draggable } from '@auzmartist/cam-el'
import { getset } from '@auzmartist/hybrids-helpers'
import { create, Node, NodeOptions, Op, Port } from '@ndjinn/core'
import { Component, define as defineHybrids, dispatch, html, RenderFunction } from 'hybrids'
import store, { redux, State } from '../../store/store.js'
import { kebab } from '../../utils.js'
import { Field, FieldModes } from './models.js'
import styles from './node-base.css?inline'
import './node-ports.js'
import { render } from './node-renderer.js'
import { TEMPLATE_BASIC_FIELDS } from './templates.js'

const emit = <E extends HTMLElement, V>(
  host: E,
  event: string,
  detail?: V,
  init: CustomEventInit = { bubbles: true, composed: true }
) => dispatch(host, event, { detail, ...init })

const computed = <E extends { node: Node }, V>(fn: (node: Node) => V) => ({
  get: ({ node }: E) => fn(node),
  connect: (host: E, key: string, invalidate: Function) => {
    host.node?.subscribe((n) => invalidate())
  },
})

export interface NodeElement extends HTMLElement {
  id: string
  name: string
  inputs: Port[]
  outputs: Port[]
  fields: Field[]
  allSelected: string[]
  selected: boolean
  incoming: any[]
  node: Node
  set: (args: any[] | object) => void
  run: () => Node['run']
  select: (host, e) => void
  draggableStart: (host, e) => void
  draggableEnd: (host, e) => void
  draggableDrag: (host, e) => void
}
type H = NodeElement

// interface NodeComponentOptions<E extends HTMLElement> extends NodeOptions {
//   component?: Component<E>
// }

export function Ndjinn() {}
Ndjinn.component = NodeComponent

export function NodeComponent<E extends HTMLElement & { name: string; icon?: string }>(
  fn: Op,
  defaults: any[],
  options?: NodeOptions & { component?: Component<E> },
  { debug }: { debug?: boolean } = {}
) {
  const nodeFnName = kebab(fn.name).toLowerCase()
  const tag = options?.component?.tag || (!!nodeFnName && `node-${nodeFnName}`)

  let hasCustomTemplate = !!options?.component?.render
  const inputFields = options?.in?.filter((i) => i.field)

  const component: Component<E> = {
    tag,
    selected: redux(store, ({ id }, state: State) => state.selected.includes(id)),
    // state restoration
    incoming: getset([]),

    inputs: computed((node: Node) => {
      if (!node.meta?.in) return []
      return [...node.meta.in].map((i: any) => ({
        ...i,
        mode: !!node.connections[i] ? FieldModes.OPAQUE : FieldModes.EDIT,
      }))
    }),
    fields: computed((node: Node) =>
      node.meta.in
        .map((input, i) => {
          const mode = !!node.connections[i] ? FieldModes.OPAQUE : FieldModes.EDIT
          return { ...input, name: input.name ?? i, mode, value: node.inputs[i] }
        })
        .filter((input) => !!input.field)
    ),
    outputs: <any>computed((node: Node) =>
      [...node.meta.out].map((o: any) => ({
        ...o,
      }))
    ),
    // prettier-ignore
    node: {
      get: (_, val) => val ?? create(fn, defaults, {
        in: options.in,
        out: options.out,
        immediate: options.immediate,
        outputCount: options.outputCount,
      }),
      connect: (host, key, invalidate) => {
        const node = host[key]
        node.subscribe(() => invalidate())

        const persistedId = host.getAttribute('id')
        if (persistedId) node.id = persistedId
        host.setAttribute('id', node.id)
        host.id = node.id

        host.run = node.run
        host.set = (...args) => {
          node.set(...args)
          emit(host, 'save')
        }

        host.incoming.forEach((c, i) => {
          if (c == null) return
          const detail = { from: c, to: { id: host.node.id, port: i } }
          emit(host, 'connect', detail)
        })

        emit(host, 'created', { node, host })
      },
    },
    __draggable__: { value: undefined, connect: Draggable({ absolutePositioning: true }) },

    // mixins
    ...options?.component,
  }

  if (!hasCustomTemplate && inputFields?.length > 0) {
    component.render = <any>renderNode(TEMPLATE_BASIC_FIELDS)
  }
  if (hasCustomTemplate) {
    component.render = <any>renderNode(options.component.render)
  }

  return {
    define(tag?: string, icon?: string) {
      component.tag = tag ?? component.tag
      if (!component.tag) throw new Error('Cannot define a custom element without a tag.')
      const name = component.tag.replace(/^node-/i, '')
      component.name = name
      component.icon = icon

      defineHybrids(component as NodeElement)
      return component
    },
  }
}

function renderNode<E extends NodeElement>(fn: RenderFunction<E>, options?: { shadowRoot?: boolean | object }) {
  // prettier-ignore
  return render((host: E) => html`
		<div
			class="${{ node: true, selected: host.selected }}"
			onmousedown="${host.draggableStart}"
			ontouchstart="${host.draggableStart}"
		>
			<div class="header" onclick="${(host, e) => emit(host, 'select', {id: host.id})}">
				<label title="${host.id}">${host.name}</label>
			</div>

			<div class="inputs">
				<node-ports
					inputs
					edges="${host.node.connections}"
					ports="${host.node.meta.in.map((input, i) => ({
						...input,
						value: host.node.inputs[i],
						mode: host.fields?.find((f) => f.name === input.name)?.mode,
					}))}"
				></node-ports>
			</div>

			<div class="outputs">
				<node-ports
					ports="${host.node.meta.out.map((output, i) => ({
						...output,
						value: host.node.outputs[i],
					}))}"
				></node-ports>
			</div>

			<div class="content">${fn(host)}</div>
		</div>
	`.style(styles),
	options)
}

// /**
//  * @deprecated Use Ndjinn.component()
//  */
// export function NodeUI<T extends NodeTemplate>(
//   fn: Op,
//   defaults: any[],
//   variants: Record<string, { fn: Op; out?: PortOptions[] }> = {},
//   template: T
// ): NodeElement {
//   function connectNode(host, node: Node, invalidate) {
//     host.setAttribute('id', node.id)
//     host.id = node.id
//     host.run = node.run
//     host.set = (...args) => {
//       // @ts-ignore
//       node.set(...args)
//       emit(host, 'save')
//     }

//   node.subscribe(() => invalidate())
//   emit(host, 'created', { node })
// }

//   return {
//     selected: redux(store, ({ id }, state: NdjinnState) => state.selected.includes(id)),
//     // state restoration
//     incoming: getset([]),

// export function NodeComponent<T extends NodeTemplate>(
//   fn: Op,
//   defaults: any[],
//   options?: NodeComponentOptions,
//   { debug }: { debug?: boolean } = {}
// ) {
//   const nodeFnName = kebab(fn.name).toLowerCase()
//   const tag = options?.component?.tag || (nodeFnName && `node-${nodeFnName}`)

//   let customTemplate = !!options?.component?.render
//   const inputFields = options?.in?.filter((i) => i.field)

//   const component: Component<NodeElementUI> = {
//     tag,
//     config: redux(store, (_, state: State) => state.config.node),
//     selected: redux(store, ({ id }, state: State) => state.selected.includes(id)),

//     // state restoration
//     incoming: getset([]),

//     node: {
//       ...getset({}),
//       connect: (host, key, invalidate) => {
//         let node = create(fn, defaults, {
//           in: template.in,
//           out: template.out,
//         })
//         const persistedId = host.getAttribute('id')
//         if (persistedId) node.id = persistedId

//         connectNode(host, node, invalidate)
//         try {
//           // connectDraggable(host)
//         } catch (ex) {
//           // swallow issues with unsupported browser touch API
//         }

//         host[key] = node
//       },
//     },
//     inputs: <any>computed((node: Node) => {
//       if (!node?.meta?.in) return []
//       return [...node.meta.in].map((i: any) => ({
//         ...i,
//         mode: !!node.connections[i] ? 'OPAQUE' : 'EDIT',
//       }))
//     }),
//     outputs: <any>computed((node: Node) => [...node.outputs]),
//     fields: ({ inputs }) => inputs.filter((i) => i.field),

//     // Custom Properties
//     ...template,
//   } as any
// }
