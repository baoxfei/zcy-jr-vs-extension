import { window, workspace } from 'vscode'
export default function getCurrentColorTheme() {
  try {
    const theme = window.activeColorTheme.kind;
    return { theme };
  } catch (error) {
    return {}
  }
}