import { window } from 'vscode';
import path from 'path'
export function getCurrentFileInfo() {
  // 获取当前活动的文本编辑器
  const editor = window.activeTextEditor;

  if (!editor) {
    return { error: "没有活动的文本编辑器" };
  }

  // 获取文档对象
  const document = editor.document;

  // 获取文件完整路径
  const fullPath = document.fileName;

  // 使用path模块解析路径
  const dirName = path.dirname(fullPath);
  const fileName = path.basename(fullPath);
  const baseName = path.basename(fullPath, path.extname(fullPath));
  const extName = path.extname(fullPath);

  // 检查文件是否有未保存的更改
  const isDirty = document.isDirty;

  // 获取语言ID
  const languageId = document.languageId;

  // 获取行数和词数
  const lineCount = document.lineCount;
  const wordCount = document.getText().split(/\s+/).length;

  return {
    fullPath,
    dirName,
    fileName,
    baseName,
    extName,
    isDirty,
    languageId,
    lineCount,
    wordCount,
  };
}

export default getCurrentFileInfo;

