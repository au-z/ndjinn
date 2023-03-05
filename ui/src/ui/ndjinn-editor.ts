import { define, html } from 'hybrids'
import { useMouse } from '../hooks'
import { CATALOG } from '../node'
import { NodeElement, NodeElementUI } from '../node/base/models'
import { deserializeNodeGraph, persist, serializeNodeGraph } from '../store/localStorage'
import store, { connectNode, createNode, deleteSelected, disconnectNode, redux, reduxTrack, saveNodeContainer, selectAll, selectNode, setDatatypes, setNodeConfig, setTransform, setTransforms, State } from '../store/store'
import { debounce } from '../utils'
import { getset } from '../utils/hybrids'
import { useNdjinnConfig } from './config/ndjinn-config'
import styles from './ndjinn-editor.css?inline'
const { save, load } = persist(store, 'ndjinn-project', serializeNodeGraph, deserializeNodeGraph)

export interface NdjinnEditor extends HTMLElement {
  [key: string]: any
}
type H = NdjinnEditor
export default define<NdjinnEditor>({
  tag: 'ndjinn-editor',
  ...useMouse,
  ...useNdjinnConfig((_, datatypes) => {
    store.dispatch(setDatatypes(datatypes))
  }),
  actionMousePos: {
    get: (_, val = { x: 0, y: 0 }) => val,
    set: (_, val) => val,
  },
  debug: false,
  throttle: 0,
  selected: redux(store, (_, { selected }: State) => selected),
  registry: redux(store, (_, { registry }: State) => registry),
  onmousemove: () => (host, e) => {
    host.mouse = { x: e.pageX, y: e.pageY }
  },
  container: reduxTrack(
    store,
    {
      get: ({ render }) => render().querySelector('ndjinn-canvas'),
      observe: (host, container: HTMLElement, last) => {
        if (!!last || !container) return
        if (host.load.nodes?.length) {
          console.info('Restoring node state from localstorage')
          host.load.nodes?.forEach((n) => container.appendChild(n))
          Object.entries(host.load.edges)?.forEach(([toNodeId, connections]: [any, any]) => {
            connections?.forEach((edge, to) => {
              // some connections are undefined
              if (!edge) return
              const fromNode = <NodeElementUI>container.children?.[edge.id]
              const toNode = <NodeElementUI>container.children?.[toNodeId]
              if (!fromNode || !toNode) return

              fromNode.node.connect(edge.port, toNode.node, to)
            })
          })
        }
      },
    },
    saveNodeContainer
  ),

  load: getset({}, (host, key) => (host[key] = load())),

  render: ({ debug, throttle, registry, onmousemove, actionMousePos }: H) =>
    html` <section tabindex="0" class="ndjinn-editor" onmousemove="${onmousemove}">
      <ndjinn-toolbar></ndjinn-toolbar>
      <ndjinn-canvas
        nodes="${registry}"
        debug=${debug}
        onselect=${onselect}
        oncreated="${oncreated}"
        onconnect="${onconnect}"
        onconnect-from="${onconnectFrom}"
        onconnect-to="${onconnectTo}"
        ondisconnect="${ondisconnect}"
        onhotkey:a="${(host, e) => store.dispatch(selectAll())}"
        onhotkey:x="${deleteNodes}"
        onhotkey:Shift+D="${duplicateSelected}"
        onhotkey:left="${nudgeSelectedLeft}"
        onhotkey:right="${nudgeSelectedRight}"
        onsave="${onsave}"
        throttle="${throttle}"
      ></ndjinn-canvas>
      <cam-hotkey-toggle id="create-node" keys="Shift+A" escape onchange="${saveMousePos}">
        <menu-mouse
          slot="on"
          x="${actionMousePos.x}"
          y="${actionMousePos.y}"
          catalog="${CATALOG}"
          onselect="${addNode}"
        ></menu-mouse>
      </cam-hotkey-toggle>

      <slot></slot>
    </section>`.style(styles),
})

function oncreated(host, { detail: { node } }) {
  store.dispatch(createNode(node))
}

function onselect(host, { detail: { id, add } }) {
  store.dispatch(selectNode(id, add))
}

const edge = {
  from: null,
  to: null,
}

function onconnectFrom(host, { detail: { id, port, type } }) {
  edge.from = { id, port, type }
  if (edge.from && edge.to) {
    store.dispatch(connectNode(edge.from, edge.to))
    edge.from = null
    edge.to = null
  }
}

function onconnectTo(host, { detail: { id, port, type } }) {
  edge.to = { id, port, type }
  if (edge.from && edge.to) {
    store.dispatch(connectNode(edge.from, edge.to))
    edge.from = null
    edge.to = null
  }
}

function onconnect(host, { detail: { from, to } }) {
  store.dispatch(connectNode(from, to))
}

function ondisconnect(host, {detail: {from, to}}) {
	store.dispatch(disconnectNode(from, to))
	edge.to = null
}

const onsave = debounce(() => save(store.getState()), 200)

function addNode(host, { detail }) {
  const menu = host.render().querySelector('cam-hotkey-toggle#create-node')
  menu.value = false

  if (detail?.tag) {
    const nodeEl = createNodeElement(detail.tag, null, host.actionMousePos)
    host.container.appendChild(nodeEl)
  }
}

export function createNodeElement(tag, id?, pos = { x: 0, y: 0 }): NodeElement {
  const nodeEl = document.createElement(tag)
  if (id) nodeEl.setAttribute('id', id)
  nodeEl.style.left = `${pos.x}px`
  nodeEl.style.top = `${pos.y}px`
  return nodeEl
}

function saveMousePos(host, e) {
  host.actionMousePos = { ...host.mousePos }
}

function deleteNodes(host, e) {
  host.selected.forEach((id) => {
    host.container.removeChild(host.container.children[id])
  })
  store.dispatch(deleteSelected())
}

function duplicateSelected(host, e) {
  host.selected.forEach((id) => {
    const node = host.container.children[id]
    const pos = {
      x: (parseFloat(/\d+/.exec(node.style.left)[0]) || 0) + 50,
      y: (parseFloat(/\d+/.exec(node.style.top)[0]) || 0) + 50,
    }
    const el = createNodeElement(node.tagName, null, pos)
    host.container.appendChild(el)
    store.dispatch(selectNode(el.id))
  })
}

function nudgeSelectedLeft(host, e) {
  console.log(host.container.children)
  host.selected.forEach((id) => {})
}
function nudgeSelectedRight(host, e) {
  console.log(host.container.children)
  host.selected.forEach((id) => {})
}
