<template>
  <div class="snippet-generator">
    <div class="header">
      <h1>代码片段生成器</h1>
    </div>
    <div class="form-container">
      <div class="form-left">
        <div class="form-left-header">
          <div>
            <el-input
              size="large"
              v-model="form.description"
              placeholder="请输入描述"
              spellcheck="false"
              autocomplete="off"
              autocorrect="off"
              autocapitalize="off"
            ></el-input>

            <el-input
              size="large"
              v-model="form.tabTrigger"
              placeholder="请输入触发词"
              spellcheck="false"
              autocomplete="off"
              autocorrect="off"
              autocapitalize="off"
            ></el-input>
          </div>
          <div>
            <el-input
              size="large"
              v-model="form.languages"
              placeholder="请输入代码片段支持的语言，以逗号分隔"
              spellcheck="false"
              autocomplete="off"
              autocorrect="off"
              autocapitalize="off"
            ></el-input>
            <el-input
              size="large"
              v-model="form.tags"
              placeholder="请输入标签，以逗号分隔"
              spellcheck="false"
              autocomplete="off"
              autocorrect="off"
              autocapitalize="off"
            ></el-input>
          </div>
        </div>
        <div class="form-left-body">
          <el-input
            type="textarea"
            :rows="30"
            size="large"
            @keydown="handleKeydown"
            v-model="form.snippet"
            placeholder="代码片段"
            spellcheck="false"
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
            ></el-input>
        </div>
      </div>
      <div class="form-right">
        <pre style="color: black;">
          {{ generateSnippet }}
        </pre>
        <el-button class="form-button" type="primary" @click="submitForm">提交</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {  reactive, computed, ref, watch } from "vue";
import parseVSCode from '../../utils/parseVSCode'
import useCommon from "../../store/common";
import { useRoute } from "vue-router";
import { message } from "ant-design-vue";
import type { Ref } from 'vue'
const form = reactive({
  description: "",
  tabTrigger: "",
  snippet: "",
  languages: "",
  tags: "",
});


const snippetType: Ref<'personal' | 'public'> = ref('personal')

const { postMessage } = useCommon();

const route = useRoute();
const descAlias = ref<string>('')

watch(() => route.query.initialValues, () => {
  try {
    if (!route.query.initialValues) return
    const { description, trigger, body, scope, tags, type, descAlias: desc } = JSON.parse(route.query.initialValues as string) || {}
    form.description = description || ""
    form.tabTrigger = trigger || ""
    form.snippet = (body || []).join('\n') || ""
    form.languages = scope || ""
    form.tags = tags || ""
    descAlias.value = desc || "";
    snippetType.value = type || 'personal';
    
  } catch (error) {
    console.log('初始化参数错误:', error);
  }
}, { immediate: true })


const generateSnippet = computed(() => parseVSCode({
  description: form.description,
  tabtrigger: form.tabTrigger,
  snippet: form.snippet,
  scope: form.languages,
}, descAlias.value))

const handleKeydown = (e) => {
  if (e.key === "Tab") {
    e.preventDefault();
    
    const initialSelectrionStart = e.currentTarget.selectionStart;
    const initialSelectrionEnd = e.currentTarget.selectionEnd;
    const stringBeforeCaret = e.currentTarget.value.substring(
      0,
      initialSelectrionStart,
    );
    const stringAfterCaret = e.currentTarget.value.substring(
      initialSelectrionEnd,
      initialSelectrionEnd + e.currentTarget.textLength,
    );
    const newValue = `${stringBeforeCaret}  ${stringAfterCaret}`;
    e.currentTarget.value = newValue;
    e.currentTarget.selectionStart = initialSelectrionStart + 2;
    e.currentTarget.selectionEnd = initialSelectrionStart + 2;
    form.value.snippet = newValue;
  }

  if (
    e.key === "i" &&
    (e.ctrlKey || e.metaKey) &&
    document.activeElement === e.currentTarget
  ) {
    e.preventDefault();

    const initialSelectrionStart = e.currentTarget.selectionStart;
    const initialSelectrionEnd = e.currentTarget.selectionEnd;
    const stringBeforeCaret = e.currentTarget.value.substring(
      0,
      initialSelectrionStart,
    );
    const stringAfterCaret = e.currentTarget.value.substring(
      initialSelectrionEnd,
      initialSelectrionEnd + e.currentTarget.textLength,
    );
    const newValue = `${stringBeforeCaret}\${1:example}${stringAfterCaret}`;
    e.currentTarget.value = newValue;
    e.currentTarget.selectionStart = initialSelectrionStart + 4;
    e.currentTarget.selectionEnd = initialSelectrionStart + 11;
    form.value.snippet = newValue;
  }
}

const submitForm = () => {
  if (!form.description || !form.snippet) {
    return message.error('代码描述和代码片段为必填项');
  }
  
  const obj = eval(`({${generateSnippet.value}})`);
  // console.log(obj[form.description], descAlias.value || form.description, form.tags, snippetType.value);
  
  postMessage({
    command: 'sendSnippet',
    data: obj[descAlias.value || form.description],
    desc: descAlias.value || form.description,
    tags: form.tags,
    type: snippetType.value
  })

  postMessage({
    command: 'closeWebview'
  })
};
</script>

<style scoped>
.snippet-generator {
  padding: 20px;
  margin: 0 auto;
  background-color: #ffffff;
  min-height: 100vh;
}

.header {
  background-color: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  text-align: center;
  margin-bottom: 20px;
}

.form-container {
  background-color: #ffffff;
  padding: 20px;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  column-gap: 6px;
  padding: 6px;
  background-color: #075688;
  .form-left,
  .form-right {
    flex: 1;
    padding: 6px;
    background-color: #ffffffbf;
    position: relative;
  }
}

.form-left-header {
  >div {
    display: flex;
    justify-content: space-between;
    gap: 6px;
    margin-bottom: 6px;
  }
}

.form-button {
  position: absolute;
  bottom: 20px;
  right: 20px;
}

.el-form-item {
  margin-bottom: 16px;
}

.el-input__inner {
  border-radius: 4px;
  border: 1px solid #dcdfe6;
}

.el-button {
  width: auto;
  margin-top: 16px;
  padding: 10px 20px;
  background-color: #409eff;
  color: #ffffff;
  border-radius: 4px;
}
</style>
