import { Descriptor } from "hybrids"

export const getset = <E, V>(defaultValue: V, connect?: Descriptor<E, V>['connect'], observe?: Descriptor<E, V>['observe']) => ({
  get: (host, val = defaultValue) => val,
  set: (host, val) => val,
  connect,
  observe,
})
