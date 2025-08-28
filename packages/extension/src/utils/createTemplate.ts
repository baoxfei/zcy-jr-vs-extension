import fs from 'fs'
import fsp from 'node:fs/promises'
import path from 'path'
import { window } from 'vscode'
import ejs from 'ejs'

export default function createTemplate(path: string, type: 'page' | 'component' = 'page') {
  if (type === 'page') {
    console.log('----->page', path);
    createPageTemplate(path, 'page')
  } else {
    window.showInformationMessage('component 暂未实现')
  }
}


export async function createPageTemplate(rootDir: string, name: string) {
  if (!fs.existsSync(rootDir)) {
    window.showErrorMessage('目标路径不存在， 请重新设置路径')
    return
  }
  const templatesPath = path.resolve(__dirname, './templates')
  const targetPath = path.join(rootDir, name)
  copyFolder(templatesPath, targetPath)
}

export async function copyFolder(src: string, dest: string) {
  if (!fs.existsSync(src)) {
    window.showErrorMessage(`文件夹 ${src} 不存在`)
    return
  }
  try {
    
    await fsp.mkdir(dest, { recursive: true  }) // recursive: true 表示递归创建文件夹
    const files = fs.readdirSync(src, { withFileTypes: true });
  
    for (const file of files) {
      if (file.isDirectory()) {
        copyFolder(path.join(src, file.name), path.join(dest, file.name))
      } else {
        console.log(src, '--->src', file.name, '--->file.name', path.join(src, file.name));
        copyFile(path.join(src, file.name), path.join(dest, file.name))
      }
    }
  } catch (error) {
    console.log(error);
  }
}

export async function copyFile(src: string, dest: string) {
  if (!fs.existsSync(src)) {
    window.showErrorMessage('文件不存在')
    return
  }
  if (fs.existsSync(dest)) {
    window.showErrorMessage('文件已存在')
    return
  }

  if(path.extname(src) === '.ejs') {
    const content = ejs.render(fs.readFileSync(src, 'utf-8'), { name: 'test' })
    return fsp.writeFile(dest, content, { encoding: 'utf-8' })
  }
    return fsp.copyFile(src, dest)
}