<template>
  <div class="home-container">
    <h1>智能开发助手</h1>
    <p>一款专为开发者打造的VSCode插件，提供代码片段生成和AI对话功能，助您快速构建代码，提升开发效率。</p>
    <div class="button-container">
      <el-button type="primary" @click="goToGenerateSnippet">生成代码片段</el-button>
      <el-button type="success" @click="goToChat">Chat</el-button>
    </div>
  </div>
</template>

<script setup>
import { ElMessage } from "element-plus";
import { useRouter } from 'vue-router';
import useCommon from '@/store/common';
const router = useRouter();
const commonStore = useCommon();

const goToGenerateSnippet = () => {
  router.push('/generateSnippet');
};

const goToChat = () => {
  if (commonStore.isUseDefaultConfig()) {
    return ElMessage.warning('请先配置API KEY');
  }
  router.push({ path: '/chat' });
};
</script>

<style scoped>
.home-container {
  padding: 20px;
  text-align: center;
}

h1 {
  margin-bottom: 20px;
}

p {
  margin-bottom: 30px;
}

.button-container {
  display: flex;
  justify-content: center;
  gap: 20px;
}
</style>