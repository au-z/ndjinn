import { Subject, Subscription } from 'rxjs'

/**
 * An Op (Invoker) describes an atomic operation performed by a Node.
 * An Op always assumes an array of inputs and outputs.
 */
export type Invoker = (...args: any[]) => any[]
export type Op = (...args: any[]) => any[] | Promise<any[]>

/**
 * A Piper maps values between nodes i.e. clamping/validation.
 * Avoid complicated pipers.
 */
export type Piper = (...args: any[]) => object | any[] | ((inputValues?: any[]) => any[])
export const PiedPiper: Piper = (...args: any[]) => [...args]

export interface PortOptions {
  name?: string
  type?: string
  field?: boolean
}

export interface Port extends PortOptions {
  value: any
}

export interface HubTrigger extends Port {
  receive: (val) => void
}
export interface HubEmitter extends Port {
  emit: (val) => void
}

export interface ConnectOptions {
  typeFrom?: string
  typeTo?: string
}

export interface NodeOptions {
  in?: PortOptions[]
  out?: PortOptions[]
  async?: boolean // run asynchronously
  outputCount?: number // number of outputs for async nodes
  variants?: Record<string, { fn: Op; out?: PortOptions[] }>
}

export interface Node {
  id: string
  inputs: any[]
  outputs: Port[]
  connections: { id: string; port: number; sub: Subscription }[]
  meta: { in: any[]; out: any[] }
  // Triggers an Op execution
  run: (args?: any[]) => Promise<Node>
  run$: Subject<void>
  // Either provides or produces new inputs. Triggers an Op execution
  set: (args: object | any[] | ((inputs: any[]) => any[])) => Node
  // reset a port to default value
  reset: (port: string | number) => void
  // connect to other nodes
  pipe: (node: Node, piper?: Piper, transform?: Function) => Node
  connect: (outputIdx: number, node: Node, inputIdx: number, transform?: Function) => Node
  edge: (idx: number, node: Node, port: number, sub: Subscription) => void
  disconnect: (name: number | string) => Node
  // side-effects from node updates
  subscribe: (fn: (node: Node) => void) => number
  unsubscribe: (number) => boolean
}
