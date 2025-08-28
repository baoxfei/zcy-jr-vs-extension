import   { ExtensionContext, window, commands,  } from 'vscode'
import { GenerateSnippetWebview } from '../webview'
import { eventBus } from '../utils'


// 展开webview
const showGenerateSnippet = (generateSnippetWebview: GenerateSnippetWebview) => {
  commands.executeCommand('setContext', 'zcy-jr.snippetView', true)
    .then(() => {
      setTimeout(() => {
        generateSnippetWebview.sendInitConfig()
        generateSnippetWebview.addListener()
      }, 500)
    })
}

// 关闭webview
const closeGenerateSnippet = (generateSnippetWebview: GenerateSnippetWebview) => {
  commands.executeCommand('setContext', 'zcy-jr.snippetView', false)
  .then(() => {
    generateSnippetWebview.removeWebviewView()
  })
}

const backToWelcome = (generateSnippetWebview: GenerateSnippetWebview) => {
  commands.executeCommand('setContext', 'zcy-jr.snippetView', false)
  .then(() => {
    generateSnippetWebview.removeWebviewView()
  })
}

export default function registerCreateView(context: ExtensionContext) {

  const generateSnippetWebview = new GenerateSnippetWebview(context)

  eventBus.on('sendMessageToWebview', (message: Object) => {
    commands.executeCommand('setContext', 'zcy-jr.snippetView', true)
      .then(() => {
        setTimeout(() => {
          generateSnippetWebview.sendInitConfig()
          generateSnippetWebview.addListener()
          generateSnippetWebview.sendMessageToWebview(message)
        }, 500)
      })
  })

  context.subscriptions.push(
    window.registerWebviewViewProvider(
      GenerateSnippetWebview.viewId,
      generateSnippetWebview,
      {
        webviewOptions: {
          retainContextWhenHidden: true,
        },
      }
    )
  )

  context.subscriptions.push(
    commands.registerCommand('zcy-jr.showGenerateSnippet', () => {
      showGenerateSnippet(generateSnippetWebview)
    })
  )

  context.subscriptions.push(
    commands.registerCommand('zcy-jr.closeGenerateSnippet', () => {
      closeGenerateSnippet(generateSnippetWebview)
    })
  )

  context.subscriptions.push(
    commands.registerCommand('zcy-jr.backToWelcome', () => {
      backToWelcome(generateSnippetWebview)
    })
  )
}