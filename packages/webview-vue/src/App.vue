
<template>
  <main>
    <RouterView></RouterView>
  </main>
</template>



<script setup>
import useCommon from '@/store/common';

import { RouterView, useRouter } from 'vue-router'
import { onMounted } from 'vue';

const common = useCommon();
const router = useRouter();

function initListener() {
  try {
    window.addEventListener('message', (event) => {
      console.log(event, 'event');
      const command = event.data.command;
      switch (command) {
        case 'aiConfig':
          common.updateAiConfig(event.data.data);
          break;
        case 'sendMessage':
          // 路由跳转到生成代码界面 同时初始化数据信息
          router.push({ path: '/generateSnippet', query: { initialValues: event.data.data } });
        default:
          break;
      }
    })
  } catch (error) {
    console.log(error, 'error');
  }
}

onMounted(() => {
  initListener();
})

</script>

<style>
main {
  max-height: 100vh;
  overflow-y: auto;
}

</style>

