import { workspace } from 'vscode'

export const getConfig = (path: string[]) => {
  const localKeys: string[] = [...path];
  if (localKeys.length === 1) return workspace.getConfiguration(localKeys[0]);
  return workspace.getConfiguration(localKeys.shift()).get(localKeys.join('.'));
}