import { ExtensionContext, SnippetString, TreeItem, commands, window } from "vscode";
import { PersonalTreeDataViewProvider } from '../webview'
import { eventBus, getWorkspacePath } from '../utils'
import { get, isEmpty } from "lodash";
import path from 'node:path'
import fs from 'fs-extra'
import { EventType } from "../utils/eventBus";
import { SearchType } from '../utils/commonConfig'
import getCurrentFileInfo from "../utils/getCurrentFileInfo";

function refreshTreeView(personalTreeView: PersonalTreeDataViewProvider) {
  personalTreeView.refresh();
  window.showInformationMessage("刷新成功")
}

async function insertSnippet(node: any) {
  const editor = window.activeTextEditor;
  if (!editor) {
    return window.showWarningMessage('请打开编辑器！')
  }
  try {
    const [body] = node.args || [];
    const snippet = new SnippetString(body.join('\n') || '')
    
    await editor.insertSnippet(snippet);
  } catch (error) {
    window.showErrorMessage('插入失败！')
  }
}

const deleteSnippet = async (personalTreeView: PersonalTreeDataViewProvider, treeItem: TreeItem) => {
  try {
    await personalTreeView.deleteSnippet(treeItem.label as string);
  } catch (error) {
    window.showErrorMessage('删除失败！')
  }
}


const searchSnippet = async (personalTreeView: PersonalTreeDataViewProvider) => {
  const pickResult = await window.showQuickPick([SearchType.KeyWords, SearchType.Tags], {
    placeHolder: "请选择搜索类型",
  })
  
  
  const result = await window.showInputBox({
    prompt: '请输入要搜索的片段名称',
    placeHolder: '请输入要搜索的片段名称',
  }) as string;
  
  if (!result) return;
  const { languageId } = getCurrentFileInfo()

  const snippetJson = personalTreeView.readPersonalSnippets();
  let filterSnippet: any[] = Object.entries(snippetJson).filter((_, value) => {
  const scope = get(value, ['scope']);
  return !scope || (scope || '').join(',').includes(languageId)
  });
  
  if (pickResult === SearchType.KeyWords) {
    // 关键字 搜索 key prefix
    filterSnippet = filterSnippet.filter(([key, value]) => {
      return key.includes(result) || get(value, ['prefix']).includes(result)
    })
  } else if (pickResult === SearchType.Tags) {
    // 标签
    filterSnippet = filterSnippet.filter(([_, value]) => {
      return (get(value, ['tags']) || '').split(',').includes(result)
    })
  }

  if (isEmpty(filterSnippet)) {
    return window.showInformationMessage('搜索结果为空');
  }

  const quickPick = window.createQuickPick();
  quickPick.items = filterSnippet.map(([key, value]) => {
    return {
      label: key,
      description: get(value, ['prefix']),
    }
  })

  quickPick.onDidChangeSelection(async (selection) => {
    if (selection[0] && languageId) {
      const { label } = selection[0];
      const snippet = snippetJson[label]
      insertSnippet({ args: [snippet.body] })
    }
    quickPick.hide();
  });

  quickPick.onDidHide(() => {
    quickPick.dispose();
  });

  quickPick.show();

}
// 导出片段
function exportSnippet(personalTreeView: PersonalTreeDataViewProvider) {
  // 获取个人代码片段
  // 导出到json文件中
  const personalSnippets = personalTreeView.readPersonalSnippets()
  try {
    const workspacePath = getWorkspacePath()
    if (workspacePath) {
      const filePath = path.join(workspacePath, './personal.json')
      fs.writeFileSync(filePath, JSON.stringify(personalSnippets, null, 2))
    }
    window.showInformationMessage('导出成功');
  } catch (error) {
    window.showErrorMessage('导出失败');
  }
}

function importSnippet(personalTreeView: PersonalTreeDataViewProvider) {
  window.showOpenDialog({
    filters: {
      'json': ['json']
    }
  }).then(filePaths => { 
    console.log(filePaths, 'filePaths');
    
  })
}


export default function registerSnippetTreeView(context: ExtensionContext) {

  const personalTreeData = new PersonalTreeDataViewProvider(context.extensionPath);
  
  const treeView = window.createTreeView(PersonalTreeDataViewProvider.viewId, {
      treeDataProvider: personalTreeData,
    })

  context.subscriptions.push(
    treeView
  );
  // @ts-ignore
  eventBus.on(EventType.PersonalSnippet, (message) => {
    const { type } = message;
    switch(type) {
      case 'refresh':
        personalTreeData.refresh();
      default:
        break;
    }
  })

  // 将命令绑定在treeItem上
  context.subscriptions.push(
    treeView.onDidChangeSelection(async e => {
      if (e.selection.length > 0) {
        try {
          const node = e.selection[0]
          console.log('------>选中了', node)
          await commands.executeCommand('zcy-jr.insertPersonalSnippet', node)
          await treeView.reveal(node, { select: false })
        } catch (error) {
          console.error(error)
        }
      }
    })
  )
  // 代码片段-刷新
  context.subscriptions.push(
    commands.registerCommand('zcy-jr.refreshPersonalTreeView', () => {
      refreshTreeView(personalTreeData)
    })
  )
  // 代码片段-插入进编辑器
  context.subscriptions.push(
    commands.registerCommand('zcy-jr.insertPersonalSnippet', insertSnippet)
  )
  // 代码片段-删除
  context.subscriptions.push(commands.registerCommand('zcy-jr.deletePersonalSnippet', (treeItem: TreeItem) => {
    deleteSnippet(personalTreeData, treeItem)
  }))

  // 代码片段-编辑
  context.subscriptions.push(commands.registerCommand('zcy-jr.editPersonalSnippet', (treeItem: TreeItem) => {
    eventBus.emit(EventType.sendMessageToWebview, get(treeItem, ['args', 1]) || {}, 'personal')
  }))

  // 搜索代码片段
  context.subscriptions.push(commands.registerCommand('zcy-jr.searchPersonalSnippet', () => {
    searchSnippet(personalTreeData)
  }))

  // 导出代码片段
  context.subscriptions.push(commands.registerCommand('zcy-jr.exportPersonalSnippet', () => {
    exportSnippet(personalTreeData)
  }))

  // 导入代码片段
  context.subscriptions.push(commands.registerCommand('zcy-jr.importPersonalSnippet', () => {
    importSnippet(personalTreeData)
  }))

}