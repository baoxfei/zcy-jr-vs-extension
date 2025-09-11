import {
  ExtensionContext,
  SnippetString,
  TreeItem,
  commands,
  window,
  workspace,
} from "vscode";
import { PublicTreeDataViewProvider } from "../webview";
import { eventBus, getWorkspacePath } from "../utils";
import path from "path";
import fs from 'fs-extra'
import { get, isEmpty } from "lodash";
import { EventType } from "../utils/eventBus";
import { SearchType } from "../utils/commonConfig";
import { getCurrentFileInfo } from '../utils/getCurrentFileInfo'

function refreshTreeView(publicTreeView: PublicTreeDataViewProvider) {
  publicTreeView.refresh();
}

async function insertSnippet(node: any) {
  const editor = window.activeTextEditor;
  if (!editor) {
    return window.showWarningMessage("请打开编辑器！");
  }
  try {
    const [body] = node.args || [];
    const snippet = new SnippetString(body.join("\n") || "");
    await editor.insertSnippet(snippet);
  } catch (error) {
    window.showErrorMessage("插入失败！");
  }
}

function uploadSnippet(publicTreeView: PublicTreeDataViewProvider) {
  publicTreeView.uploadSnippet();
}

const deleteSnippet = async (
  publicTreeView: PublicTreeDataViewProvider,
  treeItem: TreeItem
) => {
  try {
    await publicTreeView.deleteSnippet(treeItem.label as string);
    window.showInformationMessage("删除成功！");
  } catch (error) {
    window.showInformationMessage("删除失败！");
  }
};
async function searchSnippet(publicTreeView: PublicTreeDataViewProvider) {

  const pickResult = await window.showQuickPick([SearchType.KeyWords, SearchType.Tags], {
    placeHolder: "请选择搜索类型",
  })
  
  const result = await window.showInputBox({
    prompt: '请输入要搜索的片段名称/标签',
    placeHolder: '请输入要搜索的片段名称/标签，然后按回车键',
  }) as string;
  
  if (!result) return;
  const { languageId } = getCurrentFileInfo()
  const snippetJson = await publicTreeView.readPublicSnippets();

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
      return (get(value, ['tags']) || '').split(',').some((value: string) => value.includes(result))
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

const exportSnippet = async (publicTreeView: PublicTreeDataViewProvider) => {
  // 获取个人代码片段
  // 导出到json文件中
  const publicSnippets = publicTreeView.readPublicSnippets()
  try {
    const workspacePath = getWorkspacePath()
    if (workspacePath) {
      const filePath = path.join(workspacePath, './public.json')
      fs.writeFileSync(filePath, JSON.stringify(publicSnippets, null, 2))
    }
    window.showInformationMessage('导出成功');
  } catch (error) {
    window.showErrorMessage('导出失败');
  }
};

export default function registerPublicSnippetTreeView(
  context: ExtensionContext
) {
  const publicTreeData = new PublicTreeDataViewProvider(context.extensionPath);

  const treeView = window.createTreeView(PublicTreeDataViewProvider.viewId, {
    treeDataProvider: publicTreeData,
  });

  // @ts-ignore
  eventBus.on(EventType.PublicSnippet, (message) => {
    const { type } = message;
    switch(type) {
      case 'refresh':
        publicTreeData.refresh();
      default:
        break;
    }
  })

  context.subscriptions.push(treeView);
  workspace.onDidChangeConfiguration(async (e) => {
    if (e.affectsConfiguration("ZcyJr.publicSnippetsConfig")) {
      publicTreeData.getSnippetConfig();
    }
  });
  // 将命令绑定在treeItem上
  context.subscriptions.push(
    treeView.onDidChangeSelection(async (e) => {
      if (e.selection.length > 0) {
        try {
          const node = e.selection[0];
          await commands.executeCommand("zcy-jr.insertPublicSnippet", node);
          await treeView.reveal(node, { select: false });
        } catch (error) {
          console.error(error);
        }
      }
    })
  );

  // 更新本地代码片段
  context.subscriptions.push(
    commands.registerCommand("zcy-jr.refreshPublicSnippets", () => {
      refreshTreeView(publicTreeData);
    })
  );

  // 插入代码片段
  context.subscriptions.push(
    commands.registerCommand("zcy-jr.insertPublicSnippet", insertSnippet)
  );

  // 删除代码片段
  context.subscriptions.push(
    commands.registerCommand(
      "zcy-jr.deletePublicSnippet",
      (treeItem: TreeItem) => {
        deleteSnippet(publicTreeData, treeItem);
      }
    )
  );

  // 更新远端代码片段
  context.subscriptions.push(
    commands.registerCommand("zcy-jr.uploadPublicSnippet", () => {
      uploadSnippet(publicTreeData);
    })
  );

  // 导出代码片段
  context.subscriptions.push(
    commands.registerCommand("zcy-jr.exportPublicSnippet", () => {
      exportSnippet(publicTreeData);
    })
  );

  // 代码片段-编辑
  context.subscriptions.push(commands.registerCommand('zcy-jr.editPublicSnippet', (treeItem: TreeItem) => {
    eventBus.emit(EventType.sendMessageToWebview, get(treeItem, ['args', 1]) || {}, 'public')
  }))

  // 代码片段-搜索
  context.subscriptions.push(commands.registerCommand('zcy-jr.searchPublicSnippet', () => {
    searchSnippet(publicTreeData)
  }))
}
