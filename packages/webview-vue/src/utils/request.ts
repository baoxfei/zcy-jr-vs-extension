import axios from 'axios'

const axiosInstance = axios.create({})
const reg = /compatible-mode/

axiosInstance.interceptors.request.use(
  config => {
    if (reg.test(config.url || '')) {
      config.headers['Authorization'] = `Bearer sk-4a1e750bcb6741ada389f1585a5a1db3`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

axiosInstance.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    return Promise.reject(error)
  }
)

export default axiosInstance