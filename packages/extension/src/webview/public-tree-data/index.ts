import { TreeDataProvider, TreeItem, EventEmitter, ProviderResult, Event, TreeItemCollapsibleState, window } from 'vscode';
import fs from 'fs-extra'
import path from 'path'
import { request, patch } from '../../utils/request';
import { get } from 'lodash'

class PublicTreeDataViewProvider implements TreeDataProvider<TreeItem> {
  // onDidChangeTreeData?: EventEmitter<void | TreeItem | TreeItem[] | null | undefined> | undefined;
  static readonly viewId = "zcy-jr.publicSnippets";

  static readonly remoteRepoPath = '/gists/ec004ced4b6e43680982360d30585ced'

  static readonly remotePublicSnippetGistId = 'ec004ced4b6e43680982360d30585ced'

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
    return new Promise(async (resolve, reject) => {
      try {
        const snippets = await this.readPublicSnippets();
        const snippetList = Object.keys(snippets).map((item) => {
          return {
            label: item,
            description: snippets[item].description,
            contextValue: 'publicSnippetItem',
            args: [snippets[item].body],
            tooltip: (snippets[item].body || '').join('\n'),
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

 async readPublicSnippets(): Promise<Record<string, any>> {
    const snippets = fs.readFileSync(
      path.join(this.path, "./snippets/public.code-snippets"),
      "utf-8"
    );
    let [localSnippets, remoteSnippets] = await Promise.all([
      fs.readFile(path.join(this.path, "./snippets/public.code-snippets"), 'utf-8'),
      request.get(PublicTreeDataViewProvider.remoteRepoPath)
    ])
    const data = await request.get('/gists/ec004ced4b6e43680982360d30585ced')
    console.log('gist----》', get(data, ['data', 'files', 'public.code-snippets', 'content']));
    try {
      remoteSnippets = JSON.parse(get(remoteSnippets, ['data', 'files', 'public.code-snippets', 'content']));
    } catch (error) {
      remoteSnippets = {} as any;
      console.error(error)
    }
    localSnippets = eval("(" + localSnippets.toString() + ")")
    return Object.assign(localSnippets, remoteSnippets)

    // 对于不规则的json数据进行解析
    // return eval("(" + snippets.toString() + ")")
  }

  writePublicSnippets(object: any) {
    fs.writeJSONSync(
      path.join(this.path, "./snippets/public.code-snippets"),
      object,
      "utf-8"
    );
    this.refresh();
  }

  async uploadSnippet() {
    const snippets = await this.readPublicSnippets();
    try {
      await patch(PublicTreeDataViewProvider.remotePublicSnippetGistId, {
        gist_id: PublicTreeDataViewProvider.remotePublicSnippetGistId,
        description: "公共代码片段仓库",
        files: {
        'public.code-snippets':  {
          content: JSON.stringify(snippets, null),
        },
      }})
      window.showInformationMessage('上传成功');
    } catch (error) {
      console.error(error);
    }
  }

 async deleteSnippet(snippet: string) {
    try {
      const snippets = await this.readPublicSnippets();
      delete snippets[snippet];
      this.writePublicSnippets(snippets);
    } catch (error) {
      console.error('error', error)
    }
  }
}


export default PublicTreeDataViewProvider;