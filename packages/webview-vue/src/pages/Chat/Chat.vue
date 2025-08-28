<script setup lang="ts">
import { UserOutlined } from '@ant-design/icons-vue';
import { Flex } from 'ant-design-vue';
import { Bubble, Sender, useXAgent, useXChat, type BubbleListProps, XRequest } from 'ant-design-x-vue';
import { ref, computed } from 'vue';
import { get } from 'lodash';
import useCommon from '@/store/common';

defineOptions({ name: 'AXUseXChatBasicSetup' });

const roles: BubbleListProps['roles'] = {
  assistant: {
    placement: 'start',
    avatar: { icon: UserOutlined, style: { background: '#fde3cf' } },
    typing: { step: 5, interval: 20 },
    style: {
      maxWidth: '600px',
    },
  },
  user: {
    placement: 'end',
    avatar: { icon: UserOutlined, style: { background: '#87d068' } },
  },
};

const content = ref('');
const senderLoading = ref(false);

const common = useCommon();

const request = XRequest({
  baseURL: common.aiConfig.baseUrl,
  dangerouslyApiKey: common.aiConfig.apiKey,
  model: common.aiConfig.model,
})

const getMessage = (chunk) => {
  try {
    const json = chunk.data
    if (json === ' [DONE]') return ''
    const jsonData = JSON.parse(json)
    const message = get(jsonData, ['choices', 0, 'delta', 'content'])
    return message || ''
  } catch (error) {
    return ''
  }
}



// hooks里的值可以直接使用，不用.value
// Agent for request
const [agent] = useXAgent({
  request: async ({ message }, { onSuccess, onError, onUpdate }) => {
    senderLoading.value = true;
    let str = '';
    console.log('messages', requestMessages.value)
    request.create({
      messages: requestMessages.value,
      stream: true,
    }, {
      onUpdate(chunk) {
        str += getMessage(chunk);
        onUpdate(str);
      },
      onSuccess(data) {
        senderLoading.value = false;
        onSuccess(str);
      },
      onError(err) {
        senderLoading.value = false;
        onError(new Error('request failed'));
      },
    }, 
  )
  },
});

// Chat messages
const { onRequest, messages } = useXChat({
  agent: agent.value,
  requestPlaceholder: 'Waiting...',
  requestFallback: 'Mock failed return. Please try again later.',
});


const requestMessages = computed(() => {
  const postMessages = (messages.value || []).filter(n => n.status !== 'loading').map((n) => ({
    role: n.status === 'local' ? 'user' : 'assistant',
    content: n.value ? n.value.message : n.message || '',
  }));
  postMessages.unshift({
    role: 'system',
    content: "你是一个高级前端开发工程师，下面的一些问题几乎都是一些前端开发中常见的问题，你可以根据问题给出对应的解决方案。还有一些代码片段，你可以根据代码片段给出对应的解决方案。",
  });
  return postMessages;
});

</script>
<template>
  <Flex
    vertical
    gap="middle"
  >
    <Bubble.List
      :roles="roles"
      :style="{ maxHeight: 300 }"
      :items="messages.map(({ id, message, status }) => ({
        key: id,
        role: status === 'local' ? 'user' : 'assistant',
        content: message,
      }))"
    />
    <Sender
      :loading="senderLoading"
      :value="content"
      :on-change="(v) => content = v"
      :on-submit="(nextContent) => {
        onRequest(nextContent);
        content = '';
      }"
    />
  </Flex>
</template>