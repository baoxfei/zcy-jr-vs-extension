import   { ExtensionContext, window, commands,  } from 'vscode'
import { GenerateSnippetWebview } from '../webview'
import { eventBus } from '../utils'
import { EventType } from '../utils/eventBus'


// 展开webview
const showGenerateSnippet = (generateSnippetWebview: GenerateSnippetWebview) => {
  commands.executeCommand('setContext', 'zcy-jr-snippet-manager.snippetView', true)
    .then(() => {
      setTimeout(() => {
        generateSnippetWebview.sendInitConfig()
        generateSnippetWebview.addListener()
      }, 500)
    })
}

// 关闭webview
const closeGenerateSnippet = (generateSnippetWebview: GenerateSnippetWebview) => {
  commands.executeCommand('setContext', 'zcy-jr-snippet-manager.snippetView', false)
  .then(() => {
    generateSnippetWebview.removeWebviewView()
  })
}

const backToWelcome = (generateSnippetWebview: GenerateSnippetWebview) => {
  commands.executeCommand('setContext', 'zcy-jr-snippet-manager.snippetView', false)
  .then(() => {
    generateSnippetWebview.removeWebviewView()
  })
}

export default function registerCreateView(context: ExtensionContext) {

  const generateSnippetWebview = new GenerateSnippetWebview(context)

  eventBus.on(EventType.sendMessageToWebview, (message: Object, type: 'public' | 'personal') => {
    
    commands.executeCommand('setContext', 'zcy-jr-snippet-manager.snippetView', true)
      .then(() => {
        setTimeout(() => {
          generateSnippetWebview.sendInitConfig()
          generateSnippetWebview.addListener()
          generateSnippetWebview.sendMessageToWebview({ ...message, type })
        }, 500)
      })
  })

  // eventBus.on(EventType.GenerateSnippetWebview, (message: Record<string, any>) => {
  //   const { type } = message;
  //   switch(type) {
  //     case 'backToWelcome':
  //       commands.executeCommand('zcy-jr-snippet-manager.backToWelcome')
  //     default:
  //       break;
  //   }
  // })

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
    commands.registerCommand('zcy-jr-snippet-manager.showGenerateSnippet', () => {
      showGenerateSnippet(generateSnippetWebview)
    })
  )

  context.subscriptions.push(
    commands.registerCommand('zcy-jr-snippet-manager.closeGenerateSnippet', () => {
      closeGenerateSnippet(generateSnippetWebview)
    })
  )

  context.subscriptions.push(
    commands.registerCommand('zcy-jr-snippet-manager.backToWelcome', () => {
      backToWelcome(generateSnippetWebview)
    })
  )
}