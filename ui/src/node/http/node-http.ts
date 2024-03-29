import { Ndjinn } from "../..";

const fetchJson = (url, options) => fetch(url, options).then((r) => {
  if(!r.ok) throw new Error(r.statusText)
  return r.json()
}).then((json) => [json]).catch((err) => [err]) as any

const memoFetchJson = (url, options) => {
  const map = new WeakMap<RequestInit | {url: string}, Response>();
  const cached = map.get({...options, url})
  return cached ? Promise.resolve([cached]) : fetchJson(url, options);
  return fetch(url)
}

export const NodeHttp = Ndjinn.component(fetchJson,
  ['/api/v1/employee/1', {}],
  {
    async: true,
    in: [
      {type: 'str', field: true},
      {name: 'options', type: 'obj'}
    ],
    out: [
      {name: 'response', type: 'any'}
    ],
  }
)
