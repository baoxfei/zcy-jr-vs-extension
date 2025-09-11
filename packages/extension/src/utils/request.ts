import axios from "axios";
import { getConfig } from "./getConfiguration";

type HttpMethod = 'get' | 'post' | 'patch'

function requestWithToken(method: HttpMethod, url: string, data?: any, token?: string) {
  if (!token) return Promise.reject(new Error('token is required'))
  return axios({
    url,
    method,
    ...(method === 'get' ? { params: data } : { data }),
    headers: {
      'Content-Type': 'application/json',
      "Accept": "application/vnd.github+json",
      Authorization: `token ${token}`,
    },
    timeout: 10000,
  })
}

export const request = {
  get: (url: string, params?: any, token?: string) => requestWithToken('get', url, params, token),
  post: (url: string, data: any, token?: string) => requestWithToken('post', url, data, token),
  patch: (url: string, data: any, token?: string) => requestWithToken('patch', url, data, token),
}


// const octokitInstance = new Promise(async (resolve, reject) => {
//   const { Octokit } = await import('@octokit/core')
//   resolve(new Octokit({ auth: GIST_TOKEN }))
// })

// export const patch = (gist_id: string, params: any) => {
//   return octokitInstance.then((octokit) => {
//     // @ts-ignore
//     (octokit).request(`PATCH /gists/${gist_id}`, params)
//   })
// }

// export const get = (gist_id: string) => {
//   return octokitInstance.then((octokit) => {
//     // @ts-ignore
//     return (octokit).request(`GET /gists/${gist_id}`, {
//       gist_id
//     })
//   })
// }


 