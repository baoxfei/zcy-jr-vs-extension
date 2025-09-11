
import { workspace, extensions } from 'vscode';
import pkg from '../../package.json'
export default function getWorkspacePath() {
  const workspaceFolders = workspace.workspaceFolders;
  if (workspaceFolders && workspaceFolders.length > 0) {
    return workspaceFolders[0].uri.fsPath;
  } else {
    return null;
  }
}


export function getExtensionPath() {
  const { publisher, name } = pkg || {}
  return extensions.getExtension(`${publisher}.${name}`)?.extensionPath
}

