import { Uri, Webview, ExtensionContext } from 'vscode';
import { readFileSync } from 'fs';
import path from 'path';
import { modifyHtml } from './html-modify';
import { join } from 'path';

async function getHtmlForWebview(context: ExtensionContext, webview: Webview) {
  return new Promise((resolve, reject) => {
    console.log(process.env.NODE_ENV, 'NODE_ENV');
    
    if (process.env.NODE_ENV === 'development') {
      const URL = 'https://baoxfei.github.io'
      // const URL = 'http://localhost:5173/'
      fetch('https://baoxfei.github.io/zcy-jr-vs-extension/#/home', { method: 'GET' })
      .then((response) => response.text())
      .then((html) => {
        
        resolve(modifyHtml(html, {
          onopentag(name, attribs) {
            if (name ==='script' && attribs.src) attribs.src = join(URL, attribs.src)
            if (name === 'link' && attribs.href) attribs.href = join(URL, attribs.href)
            return { name, attribs }
          },
        }))
      }).catch((error) => {
        return reject(error)
      });
    } else {
      try {
        const webviewUri = webview
        .asWebviewUri(Uri.joinPath(context.extensionUri, '/dist/webview-vue'))
        .toString()
    
        const htmlText = readFileSync(path.join(context.extensionPath, '/dist/webview-vue/index.html'), 'utf-8');
        
        const html = modifyHtml(htmlText, {
          onopentag(name, attribs) {
            if (name === 'script' && attribs.src) attribs.src = join(webviewUri, attribs.src)
            if (name === 'link' && attribs.href) attribs.href = join(webviewUri, attribs.href)
            return { name, attribs }
          },
        })
        resolve(html)
      } catch (error) {
        reject(error)
      }
    }
  })
}

export default getHtmlForWebview