import { WebviewViewProvider, ExtensionContext, CancellationToken, WebviewView, WebviewViewResolveContext, workspace, window, Uri, commands, TextDocument } from 'vscode'
import { getHtmlForWebview } from '../../utils'
import { pluginName } from '../../utils/getPluginConfig'
import fs from 'fs-extra'
import path from 'path'
import { eventBus, EventType } from '../../utils/eventBus'
import PersonalTreeDataViewProvider from '../personal-tree-data'
import PublicTreeDataViewProvider from '../public-tree-data'

class GenerateSnippetWebview implements WebviewViewProvider {
  public webview?: WebviewView['webview']
  static viewId = 'zcy-jr.snippetView'
  constructor(private context: ExtensionContext) {
    this.context = context
  }
  public resolveWebviewView(webviewView: WebviewView, context: WebviewViewResolveContext, token: CancellationToken) {

    
    this.webview = webviewView.webview
    this.webview.options = {
      // 允许脚本 和 允许外部资源加载
      enableScripts: true,
      enableCommandUris: true,
      localResourceRoots: [
        Uri.file(path.join(this.context.extensionPath)),
      ]
      // localResourceRoots 限制加载内部资源
      // https://juejin.cn/post/6974440642982182920
    }


    getHtmlForWebview(this.context, this.webview).then((html) => {
      if (this.webview) {
        this.webview.html = html as string
        // this.webview.onDidReceiveMessage((message) => {
        //   console.log(`%c${JSON.stringify(message)}`, 'color:green')
        // })
      }
    })
  }
  removeWebviewView() {
    this.webview = undefined
  }

  public getCurrentColorTheme() {
    // return getCurrentColorTheme()
    // return this.context.workspace.getConfiguration('workbench').get('colorTheme')
  }

  public sendInitConfig() {
    if (this.webview) {
      const config = workspace.getConfiguration(pluginName)
      this.webview.postMessage({
        command: 'sendConfig',
        data: {
          config: config
        }
      })
    }
  }

  public sendMessageToWebview(message: Record<string, any>) {
    if (this.webview) {
      const jsonMessage = JSON.stringify(message)
      this.webview.postMessage({
        command: 'sendMessage',
        data: jsonMessage
      })
    }
  }

    // 本地存储代码片段的位置 1. 全局 2. 工作区 3. 特定语言
    // 将代码保存为 VSCode snippet 文件
    private async saveSnippetToFile(data: { code: Object, snippetName: string, tags: string, type: "public" | "personal" }) {
      // console.log(this.context.extensionPath, 'this.context.extensionPath');
      // console.log(this.context.globalStorageUri.fsPath, 'this.context.globalStorageUri');
      const isPublic = data.type === 'public';
      
      const snippetsPath = path.join(this.context.extensionPath, isPublic ? PublicTreeDataViewProvider.publicSnippetsPath : PersonalTreeDataViewProvider.personalSnippetsPath);
        if (fs.existsSync(snippetsPath)) {
        const snippets = fs.readJSONSync(snippetsPath)
        snippets[data.snippetName] = { ...data.code, tags: data.tags.split(',')  }
        fs.writeJSONSync(snippetsPath, snippets, { spaces: 2, EOL: '\n' });
        
        eventBus.emit(isPublic ? EventType.PublicSnippet : EventType.PersonalSnippet, { type: 'refresh' })
        
        window.showInformationMessage(`代码片段已保存`);
      }
      // 1. 获取工作区路径
      // const workspaceFolder = workspace.workspaceFolders?.[0];
      // if (!workspaceFolder) {
      //   window.showErrorMessage('无法找到工作区路径');
      //   return;
      // }
      
      // 2. 确定 snippet 文件路径（默认保存到 .vscode/snippets）
      // const snippetsDir = Uri.joinPath(workspaceFolder.uri, '.vscode');
      // await workspace.fs.createDirectory(snippetsDir); // 确保目录存在
      
      // const snippetFile = Uri.joinPath(snippetsDir, `${data.snippetName}.code-snippets`);
      // console.log(fs.readFileSync(snippetFile.fsPath).toString(), 'readFileSync');
      // console.log(fs.existsSync(snippetFile.fsPath));
      
      // const oldData = fs.existsSync(snippetFile.fsPath) ? fs.readJSONSync(snippetFile.fsPath, 'utf-8') : {}
      // const newData = {
      //   ...oldData,
      //   [data.snippetName]: data.code
      // }
      // fs.writeJSONSync(snippetFile.fsPath, newData, { spaces: 2, EOL: '\n' });
      // if (fs.existsSync(snippetFile.fsPath)) {
      //     const oldData = fs.readJSONSync(snippetFile.fsPath)
      //     fs.writeJSONSync(snippetFile.fsPath, {
      //       ...(data.code || {})
      //     });
      // } else {
      //   const writeObj = Object.assign({}, { [data.snippetName]: data.code  })
      //   console.log(writeObj, 'writeObj');
      //   fs.writeJSONSync(snippetFile.fsPath, writeObj);
      //   // 创建新的代码片段文件
      //   // await workspace.fs.writeFile(snippetFile, Buffer.from('{' + '\n' + data.code.toString() + '\n' + '}', 'utf-8'));
      // }
      // 3. 生成 snippet 的 JSON 内容
      // const content = JSON.stringify({}, null, 2);
      
      // 4. 写入文件
      // await workspace.fs.writeFile(snippetFile, Buffer.from('{' + '\n' + data.code + '\n' + '}', 'utf-8'));

    }
  // private async saveSnippetToFile(data: { code: string, snippetName: string, language: string }) {
  //   // 1. 获取用户全局存储路径（通过 ExtensionContext）
  //   const globalStoragePath = this.context.globalStorageUri; // 扩展的全局存储目录
  //   const snippetsDir = Uri.joinPath(globalStoragePath, 'snippets'); // 在扩展目录下创建 snippets 文件夹
  
  //   // 2. 确保目录存在
  //   await workspace.fs.createDirectory(snippetsDir);
  
  //   // 3. 生成 snippet 文件路径
  //   const snippetFile = Uri.joinPath(snippetsDir, `${data.snippetName}.code-snippets`);
  
  //   // 4. 生成 snippet 的 JSON 内容
  //   const content = JSON.stringify(data.code, null, 2);
  
  //   // 5. 写入文件
  //   await workspace.fs.writeFile(snippetFile, Buffer.from(content, 'utf-8'));
    
  //   // 6. 提示用户
  //   window.showInformationMessage(
  //     `代码片段已保存到用户配置目录：${snippetFile.fsPath}`,
  //     '查看文件'
  //   ).then(selection => {
  //     if (selection === '查看文件') {
  //       commands.executeCommand('vscode.open', snippetFile);
  //     }
  //   });
  // }

  addListener() {
    if (this.webview) {
      this.webview.onDidReceiveMessage((message) => {
        switch (message.command) {
          case 'sendSnippet':
            const { data, type, desc, tags } = message;
            console.log(message, 'message');
            
            this.saveSnippetToFile({ code: data, snippetName: desc, tags, type })
            break
          case 'closeWebview':
            commands.executeCommand('zcy-jr.backToWelcome')
            
            break
          default:
            break
        }
      })
    }
  }
}

export default GenerateSnippetWebview