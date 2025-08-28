import { ExtensionContext, SnippetString, TreeItem, commands, window } from "vscode";
import { PublicTreeDataViewProvider } from '../webview'


function refreshTreeView(publicTreeView: PublicTreeDataViewProvider) {
  publicTreeView.refresh();
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


function uploadPublicSnippet(publicTreeView: PublicTreeDataViewProvider) {
  publicTreeView.uploadSnippet()
}


const deleteSnippet = async (publicTreeView: PublicTreeDataViewProvider, treeItem: TreeItem) => {
  try {
    await publicTreeView.deleteSnippet(treeItem.label as string);
  } catch (error) {
    
  }
}


export default function registerSnippetTreeView(context: ExtensionContext) {
  const publicTreeData = new PublicTreeDataViewProvider(context.extensionPath);
  
  const treeView = window.createTreeView(PublicTreeDataViewProvider.viewId, {
      treeDataProvider: publicTreeData,
    })

  context.subscriptions.push(
    treeView
  );
  context.subscriptions.push(
    commands.registerCommand('zcy-jr.refreshPublicTreeView', () => {
      refreshTreeView(publicTreeData)
    })
  )
  context.subscriptions.push(
    commands.registerCommand('zcy-jr.insertPublicSnippet', insertSnippet)
  )
  // 将命令绑定在treeItem上
  context.subscriptions.push(
    treeView.onDidChangeSelection(async e => {
      if (e.selection.length > 0) {
        try {
          const node = e.selection[0]
          console.log('------>选中了', node)
          await commands.executeCommand('zcy-jr.insertPublicSnippet', node)
          await treeView.reveal(node, { select: false })
        } catch (error) {
          console.error(error)
        }
      }
    })
  )

  context.subscriptions.push(commands.registerCommand('zcy-jr.deletePublicSnippet', (treeItem: TreeItem) => {
    deleteSnippet(publicTreeData, treeItem)
  }))

  context.subscriptions.push(commands.registerCommand('zcy-jr.uploadPublicSnippet', () => {
      uploadPublicSnippet(publicTreeData)
  }))
}