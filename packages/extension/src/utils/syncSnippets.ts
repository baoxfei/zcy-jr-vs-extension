import * as path from "path";
import * as os from "os";
import pkg from '../../package.json';
import fs from 'fs-extra'
import { getExtensionPath } from "./getWorkspacePath";
import { PersonalTreeDataViewProvider, PublicTreeDataViewProvider } from "../webview";


// 升级版本时将数据 将保存在本地的片段数据同步到插件内
export async function syncSnippetsToPlugin() {
  console.log('syncSnippetsToPlugin');
  const extensionPath = getExtensionPath();
  if (!extensionPath) return;
  const version = pkg.version.replaceAll('.', '')
  // 版本记录
  const files = await fs.readdir(getUserSnippetDir())

  for (const file of files) {
    const fileName = path.basename(file)
    if (fileName.startsWith('personal')) {
      const personalVersion = fileName.split('.')[1]
      if (compareVersion(personalVersion.replaceAll('-', '.'), version) === CompareResult.equal) return;
      const filePath = path.join(getUserSnippetDir(), fileName)
      fs.readJSON(filePath, 'utf-8').then((obj) => {
        const pluginFilePath = path.join(extensionPath, PersonalTreeDataViewProvider.personalSnippetsPath)
        fs.writeJSON(pluginFilePath, {
          ...obj,
        }, {
          spaces: 2,
          encoding: 'utf-8',
          EOL: '\n',
        })
      })
    }
    if (fileName.startsWith('public')) {
      const publicVersion = fileName.split('.')[1]
      if (compareVersion(publicVersion.replaceAll('-', '.'), version) === CompareResult.equal) return;
      fs.readJSON(path.join(getUserSnippetDir(), fileName), 'utf-8').then((obj) => {
        const pluginFilePath = path.join(extensionPath, PublicTreeDataViewProvider.publicSnippetsPath)
        fs.writeJSON(pluginFilePath, {
          ...obj,
        }, {
          spaces: 2,
          encoding: 'utf-8',
          EOL: '\n',
        })
      })
    }
  }
}

// 关闭插件时将数据 同步到本地做保存
export async function syncSnippetsToRoot() {
  const extensionPath = getExtensionPath()
  console.log('syncSnippetsToRoot');
  if (!extensionPath) return;
  const version = pkg.version;
  const userSnippetDir = getUserSnippetDir();
  // 版本记录
  const files = await fs.readdir(userSnippetDir)
  let personalIsChange = false;
  let publicIsChange = false;
  for(const file of files) {
    const fileName = path.basename(file);
    
    if (fileName.startsWith('personal')) {
      personalIsChange = true;
      fs.unlinkSync(path.join(userSnippetDir, fileName))
      fs.copyFile(path.join(extensionPath, PersonalTreeDataViewProvider.personalSnippetsPath), path.join(userSnippetDir, `personal-${version.replaceAll('.', '-')}.json`))
    }
    if (fileName.startsWith('public')) {
      publicIsChange = true;
      fs.unlinkSync(path.join(userSnippetDir, fileName))
      fs.copyFile(path.join(extensionPath, PublicTreeDataViewProvider.publicSnippetsPath), path.join(userSnippetDir, `public-${version.replaceAll('.', '-')}.json`))
    }
  }

  // 没有personal.xxx.json文件 需初始化
  if (!personalIsChange) {
    console.log('没有personal.xxx.json文件 需初始化');
    fs.copyFile(path.join(extensionPath, PersonalTreeDataViewProvider.personalSnippetsPath), path.join(userSnippetDir, `personal.${version.replaceAll('.', '-')}.json`), (err) => {
      console.log(err);
    })
  }

  // 没有public.xxx.json文件 需初始化
  if(!publicIsChange) {
    console.log('没有public.xxx.json文件 需初始化');
    fs.copyFile(path.join(extensionPath, PublicTreeDataViewProvider.publicSnippetsPath), path.join(userSnippetDir, `public.${version.replaceAll('.', '-')}.json`))
  }
}

enum CompareResult {
  aGreater = 1,
  bGreater = -1,
  equal = 0,
}

const compareVersion = (a: string, b: string) => {
  const aArr = a.split('.');
  const bArr = b.split('.');
  for (let i = 0; i < aArr.length; i++) {
    if (aArr[i] > bArr[i]) {
      return CompareResult.aGreater;
    } else if (aArr[i] < bArr[i]) {
      return CompareResult.bGreater;
    }
  }
  return CompareResult.equal;
};



function getUserSnippetDir(): string {
  const platform = os.platform();

  if (platform === "darwin") {
    return path.join(os.homedir(), "Library/Application Support/Code/User/snippets");
  } else if (platform === "win32") {
    return path.join(process.env.APPDATA || "", "Code/User/snippets");
  } else {
    // linux
    return path.join(os.homedir(), ".config/Code/User/snippets");
  }
}
