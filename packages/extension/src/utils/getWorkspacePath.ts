
import {  workspace } from 'vscode';
export default function getWorkspacePath() {
  const workspaceFolders = workspace.workspaceFolders;
  if (workspaceFolders && workspaceFolders.length > 0) {
    return workspaceFolders[0].uri.fsPath;
  } else {
    return null;
  }
}