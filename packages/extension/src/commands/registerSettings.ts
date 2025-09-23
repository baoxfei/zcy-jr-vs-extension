import { commands, ExtensionContext } from "vscode"

export default function registerOpenSettings(context: ExtensionContext) {

  context.subscriptions.push(
    commands.registerCommand('zcy-jr-snippet-manager.openSetting', () => {
      commands.executeCommand('workbench.action.openSettings', 'zcy-jr-snippet-manager')
    })
  )
}