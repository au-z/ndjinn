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
