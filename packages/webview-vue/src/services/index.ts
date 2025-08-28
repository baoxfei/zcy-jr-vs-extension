import request from '@/utils/request'
export const  requestDeepSeek = async (data) => {
  return request({
    url: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
    method: 'POST',
    data: {
      model: 'deepseek-r1',
      messages: [
        {
          role: 'user',
          content: data
        }
      ]
    }
  })
}