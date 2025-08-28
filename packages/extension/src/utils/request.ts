import axios from "axios";

const GIST_TOKEN = ''

const gistInstance = axios.create({
  baseURL: 'https://api.github.com',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `token ${GIST_TOKEN}`
  }
})

export const request = {
  get(url: string, params?: any) {
    return gistInstance({
      url,
      method: 'get',
      params
    })
  },
  post(url: string, data: any) {
    return gistInstance({
      url,
      method: 'post',
      data
    })
  },
  patch(url: string, data: any) {
    return gistInstance({
      url,
      method: 'patch',
      data
    })
  },
}

const octokitInstance = new Promise(async (resolve, reject) => {
  const { Octokit } = await import('@octokit/core')
  resolve(new Octokit({ auth: GIST_TOKEN }))
})

export const patch = (gist_id: string, params: any) => {
  return octokitInstance.then((octokit) => {
    // @ts-ignore
    (octokit).request(`PATCH /gists/${gist_id}`, params)
  })
}

export const get = (gist_id: string) => {
  return octokitInstance.then((octokit) => {
    // @ts-ignore
    return (octokit).request(`GET /gists/${gist_id}`, {
      gist_id
    })
  })
}


 