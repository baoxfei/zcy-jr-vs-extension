import { defineStore } from 'pinia'
import { ref } from 'vue'

const defaultConfig = {
  model: 'deepseek-r1',
  apiKey: 'sk-4a1e750bcb6741ada389f1585a5a1db3',
  baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
}

const getMessageHandlerInitState = () => {
  if (typeof acquireVsCodeApi === 'function') {
    return acquireVsCodeApi()
  }
  return {
    postMessage: () => {},
    setState: () => {},
    getState: () => {},
  }
}

const useCommon = defineStore('common', () => {
  const aiConfig = ref(defaultConfig)
  const messagehandler = ref(getMessageHandlerInitState())

  const updateAiConfig = (config) => {
    aiConfig.value = config
  }
  const isUseDefaultConfig = () => {
    if (process.env.NODE_ENV === 'development') {
      return false
    }
    return JSON.stringify(aiConfig.value) === JSON.stringify(defaultConfig)
  }

  const postMessage = (message) => {
    messagehandler.value.postMessage(message)
  }

  return {
    aiConfig,
    updateAiConfig,
    isUseDefaultConfig,
    postMessage,
  }
})

export default useCommon