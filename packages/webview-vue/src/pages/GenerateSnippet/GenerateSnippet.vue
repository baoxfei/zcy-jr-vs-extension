<template>
  <div class="snippet-generator">
    <div class="header">
      <h1>代码片段生成器</h1>
    </div>
    <div class="form-container">
      <div class="form-left">
        <div class="form-left-header">
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
          {{ form.generateSnippet }}
        </pre>
        <el-button class="form-button" type="primary" @click="submitForm">提交</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { watch, reactive, onMounted, onBeforeMount } from "vue";
import parseVSCode from '../../utils/parseVSCode'
import useCommon from "../../store/common";
import { useRoute } from "vue-router";
const form = reactive({
  description: "",
  tabTrigger: "",
  snippet: "",
  generateSnippet: ""
});
const { postMessage } = useCommon();

const route = useRoute();

onBeforeMount(() => {
  try {
    if (!route.query.initialValues) return
    const { description, trigger, body } = JSON.parse(route.query.initialValues) || {}
    form.description = description
    form.tabTrigger = trigger
    form.snippet = body.join('\n')
    form.generateSnippet = parseVSCode(description, trigger, body.join('\n'))
    console.log('初始化参数:', { description, trigger, snippet: body });
    
  } catch (error) {
    console.log('初始化参数错误:', error);
  }
})


watch(() => [form.description, form.tabTrigger, form.snippet], () => {
  const { description, tabTrigger, snippet} = form;
  const generateSnippet = parseVSCode(description, tabTrigger, snippet);
  form.generateSnippet = generateSnippet;
  console.log('form.value.generateSnippet', generateSnippet);
  console.log('form.value.snippet', form.snippet);
});

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
  console.log("表单数据:", form.generateSnippet, JSON.stringify(form.generateSnippet));
  const obj = eval(`({${form.generateSnippet}})`);
  console.log(obj[form.description], 'object');
  
  postMessage({
    command: 'sendSnippet',
    data: obj[form.description],
    desc: form.description,
    
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
  display: flex;
  justify-content: space-between;
  gap: 6px;
  margin-bottom: 6px;
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
