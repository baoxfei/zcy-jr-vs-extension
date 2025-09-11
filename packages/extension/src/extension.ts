// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import  { ExtensionContext } from 'vscode';
import getCurrentColorTheme from './utils/getCurrentColorTheme'

import { registerCreateWebView, registerSettings, registerPersonalSnippetTreeView, registerPublicSnippetTreeView } from './commands'
import { syncSnippetsToPlugin, syncSnippetsToRoot } from './utils/syncSnippets';
export function activate(context: ExtensionContext) {
	// 版本更新 不能影响之前的代码片段
	syncSnippetsToPlugin()
	// 注册webview 相关命令
	registerPersonalSnippetTreeView(context)
	registerPublicSnippetTreeView(context)
	registerCreateWebView(context)
	registerSettings(context)
	getCurrentColorTheme()
}

// This method is called when your extension is deactivated
export function deactivate() {
	// 版本同步 将内容保存到本地
	syncSnippetsToRoot()
}
