import { TreeDataProvider, TreeItem, EventEmitter, ProviderResult, Event, TreeItemCollapsibleState } from 'vscode';
import fs from 'fs-extra'
import path from 'path'

class PersonalTreeDataViewProvider implements TreeDataProvider<TreeItem> {
  static readonly viewId = "zcy-jr.personalSnippets";
  static readonly personalSnippetsPath = "./snippets/personal.code-snippets";
  
  private path: string;

  private _onDidChangeTreeData: EventEmitter<
    TreeItem | undefined | null | void
  > = new EventEmitter<TreeItem | undefined | null | void>();

  readonly onDidChangeTreeData: Event<TreeItem | undefined | null | void> =
    this._onDidChangeTreeData.event;
    
  constructor(path: string) {
    this.path = path;
  }

  getChildren(element?: TreeItem): ProviderResult<TreeItem[]> {
    if (element) {
      return [];
    }
    return new Promise((resolve, reject) => {
      try {
        const snippets = this.readPersonalSnippets();
        const snippetList = Object.keys(snippets).map((item) => {
          const { description, body, prefix, tags, scope } = snippets[item] || {};
          // 通过 可视化 创建的代码片段 原始数据 回传
          const webviewObj = {
            description: description || item,
            body,
            trigger: prefix,
            descAlias: item || '',
            tags: tags || '',
            scope: scope || '',
          }
          return {
            label: item,
            description: snippets[item].description,
            contextValue: 'personalSnippetItem',
            args: [snippets[item].body, webviewObj],
            tooltip: snippets[item].body ?.join('\n') || '',
          };
        });
        resolve(snippetList);
      } catch (error) {
        console.log("error", error);
      }
    });
  }

  getTreeItem(element: TreeItem): TreeItem | Thenable<TreeItem> {
    return element;
  }

  refresh(): void {
    this._onDidChangeTreeData?.fire();
  }

  readPersonalSnippets() {
    const snippets = fs.readJSONSync(
      path.join(this.path, "./snippets/personal.code-snippets"),
      "utf-8"
    );
    return snippets;
  }

  writePersonalSnippets(object: any) {
    fs.writeJSONSync(
      path.join(this.path, "./snippets/personal.code-snippets"),
      object,
      { spaces: 2, EOL: '\n', encoding: "utf-8" }
    );
    this.refresh();
  }

  deleteSnippet(snippet: string) {
    try {
      const snippets = this.readPersonalSnippets();
      delete snippets[snippet];
      this.writePersonalSnippets(snippets);
    } catch (error) {
      console.error('error', error)
    }
  }
}


export default PersonalTreeDataViewProvider;