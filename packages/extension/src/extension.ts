// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import  { ExtensionContext } from 'vscode';
import getCurrentColorTheme from './utils/getCurrentColorTheme'

import { registerCreateWebView, registerSettings, registerPersonalSnippetTreeView, registerPublicSnippetTreeView } from './commands'
export function activate(context: ExtensionContext) {
	// 注册webview 相关命令
	registerPersonalSnippetTreeView(context)
	registerPublicSnippetTreeView(context)
	registerCreateWebView(context)
	registerSettings(context)
	getCurrentColorTheme()
}

// This method is called when your extension is deactivated
export function deactivate() {}
