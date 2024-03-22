import {define, html} from 'hybrids'
import { getset } from '@auzmartist/hybrids-helpers'
import styles from './app-cmd.css?inline'
export interface AppCmd extends HTMLElement {
  [key: string]: any
}

type H = AppCmd

export const AppCmd = define<H>({
  tag: 'app-cmd',
  tree: () => ({
    create: {

    }
  }),
  // the existing path
  path: getset([]),
  // the next part of the path
  part: {
    ...getset(''),
    observe: (host, val, last) => {
      if(last?.length > 0 && val === '' && host.path.length > 0) {
        host.part = host.path.unshift()
      }
    }
  },
  index: ({tree, path}) => {
    const pathArr = path.split('/')
    return pathArr.reduce((index, part) => index[part], {...tree})
  },
  results: getset([]),
  render: (h: H) => html`<cam-box flex="center">
    <div class="cmd">
      <span>${h.path.join('/')}</span>
      <cam-input placeholder="/cmd" value="${h.part}" onupdate="${(host, e) => host.part = e.detail}"></cam-input>
    </div>

    ${h.results?.map((r) => html`<app-cmd-result
      label="${r.label}"
      onclick="${cmd}">
      <cam-icon slot="icon">${r.icon}</cam-icon>
    </app-cmd-result>`)}
  </cam-box>`.style(styles)
})

function cmd(host, e) {
  console.log('Not implemented')
}

